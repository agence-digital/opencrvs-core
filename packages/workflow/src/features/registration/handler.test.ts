import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as fetch from 'jest-fetch-mock'
import { createServer } from '../..'
import {
  testFhirBundle,
  testFhirBundleWithIds,
  userMock,
  fieldAgentPractitionerMock,
  fieldAgentPractitionerRoleMock,
  districtMock,
  upazilaMock,
  unionMock,
  officeMock
} from '../../test/utils'
import { cloneDeep } from 'lodash'

describe('Verify handler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
  })

  describe('createBirthRegistrationHandler', () => {
    beforeEach(() => {
      fetch.mockResponses(
        [userMock, { status: 200 }],
        [fieldAgentPractitionerMock, { status: 200 }],
        [fieldAgentPractitionerRoleMock, { status: 200 }],
        [districtMock, { status: 200 }],
        [upazilaMock, { status: 200 }],
        [unionMock, { status: 200 }],
        [officeMock, { status: 200 }],
        [fieldAgentPractitionerRoleMock, { status: 200 }],
        [districtMock, { status: 200 }],
        [upazilaMock, { status: 200 }],
        [unionMock, { status: 200 }],
        [officeMock, { status: 200 }]
      )
    })
    it('returns OK for a correctly authenticated user', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: { location: 'Patient/12423/_history/1' }
            }
          ]
        })
      )
      jest
        .spyOn(require('./utils'), 'sendBirthNotification')
        .mockReturnValue('')

      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(200)
    })

    it('throws error if fhir returns an error', async () => {
      fetch.mockImplementationOnce(() => new Error('boom'))

      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(500)
    })

    it('generates a new tracking id and repeats the request if a 409 is received from hearth', async () => {
      fetch.mockResponses(
        ['', { status: 409 }],
        ['', { status: 409 }],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: { location: 'Patient/12423/_history/1' }
              }
            ]
          })
        ]
      )

      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(200)
    })

    it('fails after trying to generate a new trackingID and sending to Hearth 5 times', async () => {
      fetch.mockResponses(
        ['', { status: 409 }],
        ['', { status: 409 }],
        ['', { status: 409 }],
        ['', { status: 409 }],
        ['', { status: 409 }]
      )

      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(500)
    })
  })
})

describe('markBirthAsRegisteredHandler handler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
    fetch.mockResponses(
      [userMock, { status: 200 }],
      [fieldAgentPractitionerMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }]
    )
  })

  it('returns OK with full fhir bundle as payload', async () => {
    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    fetch.mockResponseOnce(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9',
            resource: {
              resourceType: 'Task',
              status: 'requested',
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
                }
              ],
              id: '104ad8fd-e7b8-4e3e-8193-abc2c473f2c9'
            }
          }
        ]
      })
    )
    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: testFhirBundleWithIds,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns OK with task entry as payload', async () => {
    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    fetch.mockResponseOnce(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            response: { location: 'Task/12423/_history/1' }
          }
        ]
      })
    )
    const taskBundle = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9',
          resource: {
            resourceType: 'Task',
            status: 'requested',
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
              }
            ],
            id: '104ad8fd-e7b8-4e3e-8193-abc2c473f2c9'
          }
        }
      ]
    }

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: taskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})

describe('fhirWorkflowEventHandler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
  })
  it('returns un-authorized response when scope does not match event', async () => {
    const token = jwt.sign(
      { scope: ['???'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: testFhirBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('forwards unknown events to Hearth', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({ resourceType: 'OperationOutcome' }),
      {
        headers: { Location: '/fhir/Patient/123' }
      }
    )

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir/Patient',
      payload: { id: 123, resourceType: 'Patient' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('forwards get calls with query params to Hearth', async () => {
    const mock = fetch.mockResponseOnce(
      JSON.stringify({ resourceType: 'OperationOutcome' })
    )

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'GET',
      url: '/fhir/Task?focus=Composition/123',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
    expect(mock).toBeCalledWith(
      'http://localhost:3447/fhir/Task?focus=Composition/123',
      {
        body: undefined,
        headers: { 'Content-Type': 'application/fhir+json' },
        method: 'get'
      }
    )
  })
})

describe('markBirthAsCertifiedHandler handler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
    fetch.mockResponses(
      [userMock, { status: 200 }],
      [fieldAgentPractitionerMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }]
    )
  })
  it('returns OK with full fhir bundle as payload', async () => {
    const token = jwt.sign(
      { scope: ['certify'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    fetch.mockResponseOnce(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            response: { location: 'Composition/12423/_history/1' }
          }
        ]
      })
    )
    const testCertificateFhirBundle = cloneDeep(testFhirBundleWithIds)
    testCertificateFhirBundle.entry[1].resource.identifier.push({
      system: 'http://opencrvs.org/specs/id/birth-registration-number',
      value: '12345678'
    })
    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: testCertificateFhirBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})

describe('Register handler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
    fetch.mockResponses(
      [userMock, { status: 200 }],
      [fieldAgentPractitionerMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }]
    )
  })

  it('throws error if fhir returns an error', async () => {
    fetch.mockImplementationOnce(() => new Error('boom'))

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: testFhirBundleWithIds,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })
})
