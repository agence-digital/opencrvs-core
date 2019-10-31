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

export const Next = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={48} height={40} {...props}>
    <g fill="none" fillRule="evenodd">
      <rect fill="#FFF" width={48} height={40} rx={20} />
      <path
        stroke="#4C68C1"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fillRule="nonzero"
        d="M22.343 14.4L28 20.057l-5.657 5.657"
      />
    </g>
  </svg>
)
