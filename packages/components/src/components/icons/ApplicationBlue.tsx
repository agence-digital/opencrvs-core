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
import * as React from 'react'

export const ApplicationBlue = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      d="M5 3a1 1 0 0 1 1-1h7.174a2 2 0 0 1 1.415.587l4.827 4.835A2 2 0 0 1 20 8.835V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3z"
      stroke="#5E93ED"
      strokeWidth={2}
    />
    <path d="M13 2l7 7h-6a1 1 0 0 1-1-1V2z" fill="#5E93ED" />
  </svg>
)
