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
import { query, writePoints } from './../../utils/influx-helper.js'

export const up = async (db, client) => {
  const session = client.startSession()
  await session.withTransaction(async () => {
    await migrateRegistrations('birth_registration', db)
    await migrateRegistrations('death_registration', db)
  })
}

const LIMIT = 100

async function migrateRegistrations(measurement, db) {
  const result = await query(
    `SELECT COUNT(compositionId) as total FROM ${measurement} WHERE registrarPractitionerId = ''`
  )

  const totalCount = result[0]?.total ?? 0

  console.log(
    `Migration - InfluxDB :: Total points found for measurement ${measurement}: ${totalCount}`
  )

  let processed = 0

  while (processed < totalCount) {
    const registrations = await query(
      `SELECT * FROM ${measurement} WHERE registrarPractitionerId = '' LIMIT ${LIMIT}`
    )
    console.log(
      `Migration - InfluxDB :: Processing ${measurement}, ${processed + 1}-${
        processed + registrations.length
      }`
    )
    const updatedPoints = await getUpdatedPoints(registrations, measurement, db)

    await writePoints(updatedPoints)

    const startTime = registrations[0].time.getNanoTime()
    const endTime = registrations[registrations.length - 1].time.getNanoTime()

    const deleteQuery = `DELETE FROM ${measurement} WHERE registrarPractitionerId = '' AND time >= ${startTime} AND time <= ${endTime}`
    await query(deleteQuery)

    processed += registrations.length
    console.log(
      `Migration - InfluxDB :: Processing done: ${(
        (processed / totalCount) *
        100
      ).toFixed(2)}%`
    )
  }
}

const getUpdatedPoints = async (registrations, measurement, db) => {
  return Promise.all(
    registrations.map(
      async ({
        compositionId,
        time,
        ageInDays,
        ageInYears,
        currentStatus,
        deathDays,
        ...tags
      }) => {
        let task = await db.collection('Task').findOne({
          focus: {
            reference: `Composition/${compositionId}`
          },
          'businessStatus.coding.code': 'REGISTERED'
        })

        if (!task) {
          task = await db.collection('Task_history').findOne({
            focus: {
              reference: `Composition/${compositionId}`
            },
            'businessStatus.coding.code': 'REGISTERED'
          })
        }

        const practitionerExtension = task.extension.find(
          (extension) =>
            extension.url === 'http://opencrvs.org/specs/extension/regLastUser'
        )
        const id = practitionerExtension.valueReference.reference.replace(
          'Practitioner/',
          ''
        )
        const fields = { compositionId, currentStatus }
        if (measurement === 'birth_registration') {
          fields.ageInDays = ageInDays
        }
        if (measurement === 'death_registration') {
          fields.deathDays = deathDays
          fields.ageInYears = ageInYears
        }

        const practitioner = await db.collection('Practitioner').findOne({ id })

        return {
          measurement,
          tags: {
            ...tags,
            registrarPractitionerId: practitioner.id
          },
          fields,
          timestamp: time.getNanoTime()
        }
      }
    )
  )
}

export const down = async (db, client) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
}
