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
import React from 'react'
import { CustomIcon } from '../types'

export const Draft: CustomIcon = ({ size, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path
      d="M3 1.03125C3 0.478966 3.44772 0.03125 4 0.03125L13.804 0.03125L21 7.24028V23.0312C21 23.5835 20.5523 24.0312 20 24.0312H4C3.44772 24.0312 3 23.5835 3 23.0312V1.03125Z"
      fill="#B392D4"
    />
    <path
      d="M13.7998 0.03125L20.9998 7.23125H13.7998V0.03125Z"
      fill="#673A93"
    />
  </svg>
)
