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
import { createStore } from '@register/store'
import { SubmissionController } from '@register/SubmissionController'
import { SUBMISSION_STATUS } from '@register/applications'
import { Action } from './forms'

describe('Submission Controller', () => {
  it('starts the interval', () => {
    window.setInterval = jest.fn()
    const { store } = createStore()
    new SubmissionController(store).start()
    expect(setInterval).toBeCalled()
  })

  it('does nothing if sync is already running', () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              submissionStatus: SUBMISSION_STATUS.READY_TO_SUBMIT
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const subCon = new SubmissionController(store)
    subCon.syncRunning = true
    subCon.sync()

    expect(store.dispatch).not.toBeCalled()
  })

  it('does nothing if offline', () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              submissionStatus: SUBMISSION_STATUS.READY_TO_SUBMIT
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const subCon = new SubmissionController(store)
    // @ts-ignore
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      writable: true
    })
    subCon.sync()
    // @ts-ignore
    Object.defineProperty(global.navigator, 'onLine', {
      value: true,
      writable: true
    })

    expect(store.dispatch).not.toBeCalled()
  })

  it('syncs all ready to submit and network failed applications in the queue', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              submissionStatus: SUBMISSION_STATUS.READY_TO_SUBMIT
            },
            {
              submissionStatus: SUBMISSION_STATUS.FAILED_NETWORK
            },
            {
              submissionStatus: SUBMISSION_STATUS.FAILED
            },
            {
              submissionStatus: SUBMISSION_STATUS.SUBMITTED
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const subCon = new SubmissionController(store)
    subCon.client = {
      mutate: jest.fn().mockResolvedValueOnce({
        data: {
          createBirthRegistration: {
            compositionId: '123',
            trackingId: 'Baaaaaa'
          }
        }
      })
    }

    await subCon.sync()

    expect(subCon.client.mutate).toHaveBeenCalledTimes(2)
    expect(store.dispatch).toHaveBeenCalledTimes(8)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.SUBMITTED)
    expect(
      store.dispatch.mock.calls[1][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.SUBMITTED)
  })

  it('sync all ready to approve application', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              submissionStatus: SUBMISSION_STATUS.READY_TO_APPROVE,
              action: Action.APPROVE_APPLICATION
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const subCon = new SubmissionController(store)

    subCon.client = {
      mutate: jest
        .fn()
        .mockResolvedValueOnce({ data: { markBirthAsValidated: {} } })
    }

    await subCon.sync()

    expect(subCon.client.mutate).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.APPROVED)
  })

  it('fails a application that has a network error', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              submissionStatus: SUBMISSION_STATUS.READY_TO_SUBMIT
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const subCon = new SubmissionController(store)

    const err = new Error('boom')
    // @ts-ignore
    err.networkError = new Error('network boom')
    subCon.client = { mutate: jest.fn().mockRejectedValueOnce(err) }

    await subCon.sync()

    expect(subCon.client.mutate).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.FAILED_NETWORK)
  })

  it('fails a application that has an ordinary error', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              submissionStatus: SUBMISSION_STATUS.READY_TO_SUBMIT
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const subCon = new SubmissionController(store)

    const err = new Error('boom')
    // @ts-ignore
    subCon.client = { mutate: jest.fn().mockRejectedValueOnce(err) }

    await subCon.sync()

    expect(subCon.client.mutate).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.FAILED)
  })
})
