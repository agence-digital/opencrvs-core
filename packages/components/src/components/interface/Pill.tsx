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
import styled from 'styled-components'

type IPillType = 'active' | 'inactive' | 'pending' | 'default'

type IPillSize = 'small' | 'medium'

export interface IPillProps {
  label: string
  type?: IPillType
  size?: IPillSize
}

const heightMap = {
  small: '24px',
  medium: '32px'
}

const colorMap = {
  active: 'rgba(73, 183, 141, 0.3)',
  default: 'rgba(206, 206, 206, 0.3)',
  inactive: 'rgba(245, 209, 209, 1)',
  pending: 'rgba(252, 236, 217, 1)'
}

const fontMap = {
  small: 'captionBold',
  medium: 'subtitleStyle'
}

const paddingMap = {
  small: '10px',
  medium: '14px'
}

const StyledPill = styled.span<{ size: IPillSize; type: IPillType }>`
  display: inline-flex;
  padding: 0 ${({ size }) => paddingMap[size]};
  background-color: ${({ type }) => colorMap[type]};
  height: ${({ size }) => heightMap[size]};
  align-items: center;
  border-radius: 100px;
  ${({ size, theme }) => theme.fonts[fontMap[size]]}
`

export function Pill({ label, type = 'default', size = 'small' }: IPillProps) {
  return (
    <StyledPill type={type} size={size}>
      {label}
    </StyledPill>
  )
}
