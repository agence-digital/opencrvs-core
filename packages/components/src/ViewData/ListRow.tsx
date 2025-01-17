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
import styled from 'styled-components'
import { Link } from '../Link'
import { Button } from '../Button'

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  padding: 16px 0px;
  width: 100%;
  &:last-child {
    border-bottom: none;
  }
`
const ListDataContainer = styled.div`
  align-items: center;
  ${({ theme }) => theme.fonts.bigBody};
  display: flex;
  flex-grow: 1;
  max-width: 90%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-direction: column;
    width: 100%;
  }
`
const ValueContainer = styled.div`
  ${({ theme }) => theme.fonts.bigBody};
  width: 100%;
`
const Label = styled.label`
  ${({ theme }) => theme.fonts.bold16};
  flex: 1;
  margin-right: 10%;
  max-width: 40%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    max-width: 100%;
    ${({ theme }) => theme.fonts.bold16};
    margin-right: auto;
  }
`
const Value = styled.div`
  ${({ theme }) => theme.fonts.reg16};
  flex: 1;
  overflow-wrap: break-word;
  max-width: 50%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.reg16};
    max-width: 100%;
    margin-right: auto;
  }
`

const LabelValueLayer = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.reg16};
    width: 80%;
  }
`

const HideOnMobile = styled.div`
  display: inline;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const HideOnDesktop = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: flex;
  }
`

const PlaceHolder = styled.div`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.supportingCopy};
  flex: 1;
`
const Action = styled.div`
  width: auto;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: auto;
  }
`

const StatusContainer = styled.div`
  width: auto;
  margin-left: 250px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-right: auto;
    margin-top: 15px;
    margin-left: 45px;
  }
`

const MenuContainer = styled.div`
  margin-left: 30%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    max-width: 40%;
    margin-left: auto;
  }
`

const ProfileInfoContainer = styled.div`
  display: flex;
  width: 10%;
  white-space: nowrap;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-right: auto;
    ${({ theme }) => theme.fonts.reg16};
    width: 50%;
  }
`

interface IAction {
  id?: string
  label: string
  disabled?: boolean
  handler?: () => void
}

export interface IListRowProps {
  id?: string
  label: string | React.ReactNode
  value?: React.ReactNode
  placeHolder?: string
  action?: IAction
  actionsMenu?: React.ReactNode
  actionType?: ActionType
  isLinkLabel?: boolean
  onClickLabelLink?: () => void
  status?: React.ReactNode
  nameWithAvatar?: React.ReactNode
}

export enum ActionType {
  LINK = 'link',
  ICON = 'icon',
  BUTTON = 'button'
}

export class ListRow extends React.Component<IListRowProps> {
  render() {
    const {
      id,
      label,
      value,
      placeHolder,
      action,
      actionsMenu,
      actionType,
      isLinkLabel,
      onClickLabelLink,
      nameWithAvatar
    } = this.props

    return (
      <Container id={id}>
        {label && (
          <>
            <LabelValueLayer>
              <ListDataContainer>
                {isLinkLabel ? (
                  <Label id={`${id}_label`}>
                    <Link
                      onClick={() => onClickLabelLink && onClickLabelLink()}
                    >
                      {label}
                    </Link>
                  </Label>
                ) : nameWithAvatar ? (
                  <ProfileInfoContainer id={`${id}_label`}>
                    {nameWithAvatar}
                  </ProfileInfoContainer>
                ) : (
                  <Label id={`${id}_label`}>{label}</Label>
                )}
                {value && <Value id={`${id}_value`}>{value}</Value>}
                {placeHolder && (
                  <PlaceHolder id={`${id}_placeholder`}>
                    {placeHolder}
                  </PlaceHolder>
                )}
                <HideOnDesktop>
                  {this.props.status && (
                    <StatusContainer>{this.props.status}</StatusContainer>
                  )}
                </HideOnDesktop>
              </ListDataContainer>
              <HideOnMobile>
                {actionsMenu && <MenuContainer>{actionsMenu}</MenuContainer>}
              </HideOnMobile>
            </LabelValueLayer>
            {action && (actionType === ActionType.LINK || !actionType) && (
              <Action>
                <Link
                  id={action.id}
                  font="reg16"
                  disabled={action.disabled}
                  onClick={action.handler}
                >
                  {action.label}
                </Link>
              </Action>
            )}
            {action && actionType === ActionType.ICON && (
              <Action>
                <Link
                  id={action.id}
                  font="reg16"
                  disabled={action.disabled}
                  onClick={action.handler}
                >
                  {action.label}
                </Link>
              </Action>
            )}
            {action && actionType === ActionType.BUTTON && (
              <Action>
                <Button
                  type="primary"
                  id={action.id}
                  disabled={action.disabled}
                  onClick={action.handler}
                >
                  {action.label}
                </Button>
              </Action>
            )}
            <HideOnDesktop>
              {actionsMenu && <MenuContainer>{actionsMenu}</MenuContainer>}
            </HideOnDesktop>
          </>
        )}
        {!label && <ValueContainer>{value}</ValueContainer>}
      </Container>
    )
  }
}
