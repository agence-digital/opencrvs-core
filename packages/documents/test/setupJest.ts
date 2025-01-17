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
import { join } from 'path'
import * as fetch from 'jest-fetch-mock'

jest.setMock('node-fetch', { default: fetch })
jest.mock('@documents/minio/client', () => ({
  __esModule: true,
  defaultMinioBucketExists: jest.fn(),
  createDefaultMinioBucket: jest.fn()
}))

process.env.CERT_PUBLIC_KEY_PATH = join(__dirname, './cert.key.pub')
process.env.NODE_ENV = 'TEST'
