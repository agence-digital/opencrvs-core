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
import { OPENCRVS_SPECIFICATION_URL } from '@workflow/features/registration/fhir/constants'
import { setTrackingId } from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import {
  getBirthRegistrationNumber,
  getEntryId,
  getInformantName,
  getCRVSOfficeName,
  getPaperFormID,
  getRegStatusCode,
  getSharedContactMsisdn,
  getTrackingId
} from '@workflow/features/registration/fhir/fhir-utils'
import {
  testFhirBundle,
  testFhirTaskBundle,
  officeMock
} from '@workflow/test/utils'
import { cloneDeep } from 'lodash'
import * as fetchAny from 'jest-fetch-mock'
const fetch = fetchAny as any

describe('Verify getSharedContactMsisdn', () => {
  it('Returned shared contact number properly', async () => {
    const phoneNumber = await getSharedContactMsisdn(testFhirBundle)
    expect(phoneNumber).toEqual('+8801622688231')
  })

  it('Throws error when invalid fhir bundle is sent', async () => {
    await expect(
      getSharedContactMsisdn({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).rejects.toThrow('Invalid FHIR bundle found for declaration')
  })

  it('Returns false when phonenumber is missing for shared contact', async () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    if (
      fhirBundle &&
      fhirBundle.entry &&
      fhirBundle.entry[1] &&
      fhirBundle.entry[1].resource &&
      fhirBundle.entry[1].resource.extension &&
      fhirBundle.entry[1].resource.extension[1] &&
      fhirBundle.entry[1].resource.extension[1].url
    ) {
      fhirBundle.entry[1].resource.extension[1].url = 'INVALID'
      expect(await getSharedContactMsisdn(fhirBundle)).toEqual(false)
    } else {
      throw new Error('Failed')
    }
  })
})

describe('Verify getInformantName', () => {
  it('Returned informant name properly', async () => {
    const informantName = await getInformantName(testFhirBundle)
    expect(informantName).toEqual('অনিক অনিক')
  })

  it('Throws error when invalid fhir bundle is sent', async () => {
    await expect(
      getInformantName({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).rejects.toThrow('Invalid FHIR bundle found for declaration')
  })

  it('Throws error when child name section is missing', async () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[2].resource.name = undefined
    await expect(getInformantName(fhirBundle)).rejects.toThrow(
      "Didn't find informant's name information"
    )
  })

  it("Throws error when child's bn name block is missing", async () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[2].resource.name = []
    await expect(getInformantName(fhirBundle)).rejects.toThrow(
      "Didn't found informant's bn name"
    )
  })
})

describe('Verify getCRVSOfficeName', () => {
  it('Returned informant name properly', async () => {
    fetch.mockResponse(officeMock)
    const officeName = await getCRVSOfficeName(testFhirBundle)
    expect(officeName).toEqual('নকল অফিস')
  })

  it('Throws error when invalid fhir bundle is sent', async () => {
    await expect(
      getCRVSOfficeName({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).rejects.toThrow(
      'getCRVSOfficeName: Invalid FHIR bundle found for declaration/notification'
    )
  })

  it('Throws error when last reg office info is missing', async () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[1].resource.extension = []
    await expect(getCRVSOfficeName(fhirBundle)).rejects.toThrow(
      'No last registration office found on the bundle'
    )
  })
})

describe('Verify getTrackingId', () => {
  it('Returned tracking id properly', () => {
    const trackingid = getTrackingId(setTrackingId(testFhirBundle))
    if (trackingid) {
      expect(trackingid).toMatch(/^B/)
      expect(trackingid.length).toBe(7)
    } else {
      throw new Error('Failed')
    }
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    expect(() =>
      getTrackingId({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).toThrowError('getTrackingId: Invalid FHIR bundle found for declaration')
  })
})

describe('Verify getBirthRegistrationNumber', () => {
  it('Returned birth registration number properly', async () => {
    const taskResource: fhir.Task = {
      identifier: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`,
          value: '2019333436B5WGYJE8'
        }
      ],
      status: '',
      intent: ''
    }
    const brn = getBirthRegistrationNumber(taskResource)

    expect(brn).toBeDefined()
    expect(brn).toEqual('2019333436B5WGYJE8')
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    const testTask = {
      resourceType: 'Task',
      status: 'requested',
      intent: '',
      focus: {
        reference: 'urn:uuid:888'
      },
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/types',
            code: 'birth-registration'
          }
        ]
      },
      identifier: [],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/contact-person',
          valueString: 'MOTHER'
        },
        {
          url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
          valueString: '+8801622688231'
        }
      ]
    }

    expect(() =>
      getBirthRegistrationNumber(testTask as fhir.Task)
    ).toThrowError("Didn't find any identifier for birth registration number")
  })
})

describe('Verify getRegStatusCode', () => {
  it('Returned right registration status based on token scope', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: '1573112965',
      algorithm: '',
      aud: '',
      sub: '1',
      scope: ['register']
    }
    const regStatus = getRegStatusCode(tokenPayload)
    expect(regStatus).toBeDefined()
    expect(regStatus).toBe('REGISTERED')
  })

  it('Throws error when invalid token has no scope', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: '1573112965',
      algorithm: '',
      aud: '',
      sub: '1',
      scope: []
    }
    expect(() => getRegStatusCode(tokenPayload)).toThrowError(
      'No valid scope found on token'
    )
  })

  it('Throws error when invalid token scope is provided', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: '1573112965',
      algorithm: '',
      aud: '',
      sub: '1',
      scope: ['invalid']
    }
    expect(() => getRegStatusCode(tokenPayload)).toThrowError(
      'No valid scope found on token'
    )
  })
})
describe('Verify getPaperFormID', () => {
  it('Returned paper form id properly', () => {
    const testTask = {
      resourceType: 'Task',
      status: 'requested',
      intent: '',
      focus: {
        reference: 'urn:uuid:888'
      },
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/types',
            code: 'birth-registration'
          }
        ]
      },
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/paper-form-id',
          value: '12345678'
        },
        {
          system: 'http://opencrvs.org/specs/id/birth-tracking-id',
          value: 'B5WGYJE'
        }
      ],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/contact-person',
          valueString: 'MOTHER'
        },
        {
          url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
          valueString: '+8801622688231'
        }
      ]
    }
    const paperFormID = getPaperFormID(testTask)
    expect(paperFormID).toEqual('12345678')
  })
  it('Throws error when paper form id not found', () => {
    const testTask = {
      resourceType: 'Task',
      status: 'requested',
      intent: '',
      focus: {
        reference: 'urn:uuid:888'
      },
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/types',
            code: 'birth-registration'
          }
        ]
      },
      identifier: [],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/contact-person',
          valueString: 'MOTHER'
        },
        {
          url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
          valueString: '+8801622688231'
        }
      ]
    }
    expect(() => getPaperFormID(testTask)).toThrowError(
      "Didn't find any identifier for paper form id"
    )
  })
})

describe('Verify getEntryId', () => {
  it('Returned entry id properly', () => {
    const entryId = getEntryId(testFhirTaskBundle)
    expect(entryId).toMatch('ba0412c6-5125-4447-bd32-fb5cf336ddbc')
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    expect(() =>
      getEntryId({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).toThrowError('getEntryId: Invalid FHIR bundle found for declaration')
  })
})
