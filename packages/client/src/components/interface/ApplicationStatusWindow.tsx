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
import { Cross } from '@opencrvs/components/lib/icons'
import { ITheme } from '@opencrvs/components/lib/theme'
import React from 'react'
import styled, { withTheme } from 'styled-components'

interface IProps {
  width: number
  crossClickHandler: () => void
  title: React.ReactNode | string
  children: React.ReactNode
  theme: ITheme
}

const ExpandableWindow = styled.div<{
  width: number
}>`
  position: fixed;
  top: 64px;
  right: 0;
  z-index: 1;
  height: 100%;
  width: ${({ width }) => `${width}px`};
  border: 1px solid ${({ theme }) => theme.colors.dividerDark};
  color: ${({ theme }) => theme.colors.copy};
  transition: all 0.03s;
  background-color: ${({ theme }) => theme.colors.white};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
    top: 56px;
  }
`

const TopBar = styled.div`
  height: 72px;
  display: flex;
  flex-direction: row;

  align-items: center;
  justify-content: space-between;
  padding: 0 12px;

  background-color: ${({ theme }) => theme.colors.lightGreyBackground};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dividerDark};
`

const Title = styled.div``

class ExpandableSideWindowComponent extends React.Component<IProps> {
  render() {
    return (
      <ExpandableWindow width={this.props.width}>
        <TopBar>
          <Title>{this.props.title}</Title>
          <Cross onClick={this.props.crossClickHandler} />
        </TopBar>
        {this.props.children}
      </ExpandableWindow>
    )
  }
}

export const ExpandableSideWindow = withTheme(ExpandableSideWindowComponent)
