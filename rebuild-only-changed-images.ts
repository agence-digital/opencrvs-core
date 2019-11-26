/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import * as yaml from 'js-yaml'
import { readFileSync, writeFileSync } from 'fs'
import fetch from 'node-fetch'
import * as cp from 'child_process'
import { promisify } from 'util'

const exec = promisify(cp.exec.bind(cp))

const { DOCKER_USERNAME, DOCKER_PASSWORD } = process.env

async function getToken() {
  const response = await fetch('https://hub.docker.com/v2/users/login/', {
    method: 'POST',
    body: JSON.stringify({
      username: DOCKER_USERNAME,
      password: DOCKER_PASSWORD
    }),

    headers: {
      'Content-Type': 'application/json'
    }
  })

  const body = await response.json()
  return body.token
}

async function getLatestTag(token: string, repository: string) {
  const response = await fetch(
    `https://hub.docker.com/v2/repositories/${repository}/tags`,
    {
      headers: {
        Authorization: `JWT ${token}`
      }
    }
  )
  const body = await response.json()

  if (!body.results) {
    return null
  }

  const latest = body.results.find(({ name }) => name === 'latest')
  return body.results.find(
    ({ name, images }) =>
      name !== 'latest' && images[0].digest === latest.images[0].digest
  )
}

const IMAGE_NAME_TO_DIRECTORY = {
  styleguide: 'components'
}

async function preventBuildImageFromBeingBuilt() {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
  pkg.scripts['build:image'] = 'echo "Skipping build image creation..."'
  writeFileSync('./package.json', JSON.stringify(pkg))
}
async function ignoreFromBuild(packages: string[]) {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
  pkg.scripts['build'] =
    pkg.scripts['build'] +
    ' ' +
    packages.map(directory => `--ignore ${directory}`).join(' ')
  writeFileSync('./package.json', JSON.stringify(pkg))
}

async function run() {
  const compose = yaml.safeLoad(readFileSync('./docker-compose.yml', 'utf8'))

  const token = await getToken()

  // Not sure why but docker hub's API sometimes fails if you query it right after getting a token
  await new Promise(resolve => setTimeout(resolve, 1000))

  const serviceNames = Object.keys(compose.services)

  const packagesThatAreUpToDate = []

  for (const serviceName of serviceNames) {
    const service = compose.services[serviceName]
    const { image } = service
    const repository = image.split(':')[0]
    const imageName = repository.replace('jembi/ocrvs-', '')
    const directory = IMAGE_NAME_TO_DIRECTORY[imageName] || imageName

    const latestGitHash = (await exec(
      `git --no-pager log -n 1 --format="%h" -- "packages/${directory}"`
    )).trim()

    const latestTag = await getLatestTag(token, repository)
    if (!latestTag) {
      console.log('⚠️ ', serviceName, ': no tags found!')
      continue
    }

    const imageHash = latestTag.name

    try {
      // Check that image hash is newer or the same as the latest commit of this package
      await exec(`git merge-base --is-ancestor ${latestGitHash} ${imageHash}`)
      console.log('✅ ', serviceName, ': no rebuild needed')
      service.image = `${repository}:latest`
      delete service.build
      packagesThatAreUpToDate.push(directory)
    } catch {
      console.log('♻️ ', serviceName, ': rebuilding...')
    }
  }
  writeFileSync('./docker-compose.yml', yaml.safeDump(compose))

  // All services can be fetched from docker hub
  if (packagesThatAreUpToDate.length === serviceNames.length) {
    console.log('No packages to rebuild. Removing build image creation step.')
    await preventBuildImageFromBeingBuilt()
  } else {
    await ignoreFromBuild(packagesThatAreUpToDate)
  }
}

run()