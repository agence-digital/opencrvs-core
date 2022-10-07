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
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { internal } from '@hapi/boom'
import { invalidateToken } from '@auth/features/invalidateToken/service'
import { postUserActionToMetrics } from '@auth/features/authenticate/service'

interface IInvalidateTokenPayload {
  token: string
  practitionerId: string
}

export default async function invalidateTokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { token, practitionerId } = request.payload as IInvalidateTokenPayload
  try {
    await postUserActionToMetrics('LOGGED_OUT', practitionerId, token)
    await invalidateToken(token)
  } catch (err) {
    throw internal('Failed to invalidate token', err)
  }

  return {}
}

export const reqInvalidateTokenSchema = Joi.object({
  token: Joi.string(),
  practitionerId: Joi.string()
})
