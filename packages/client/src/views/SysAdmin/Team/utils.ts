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
import {
  IFormField,
  IFormSectionData,
  ISelectFormFieldWithDynamicOptions,
  ISelectFormFieldWithOptions
} from '@client/forms'
import { userMessages } from '@client/i18n/messages'
import { IntlShape, MessageDescriptor } from 'react-intl'
import { messages } from '@client/i18n/messages/views/userSetup'
import { Roles } from '@client/utils/authUtils'
import { IUserRole } from '@client/utils/userUtils'

export enum UserStatus {
  ACTIVE,
  DEACTIVATED,
  PENDING,
  DISABLED
}

export const transformRoleDataToDefinitions = (
  fields: IFormField[],
  data: any,
  userFormData: IFormSectionData
): IFormField[] => {
  const roles = data as Array<any>
  const transformTypes = (types: string[]) =>
    types.map((type) => ({
      label: userMessages[type],
      value: type
    }))

  return fields.map((field) => {
    if (field.name === 'systemRole') {
      if (userFormData && userFormData.systemRole) {
        userFormData.systemRole = ''
      }
      ;(field as ISelectFormFieldWithOptions).options = roles.map(
        ({ value }: { value: string }) => ({
          label: userMessages[value],
          value
        })
      )
      return field
    } else if (field.name === 'type') {
      if (userFormData && userFormData.type) {
        userFormData.type = ''
      }
      ;(field as ISelectFormFieldWithDynamicOptions).dynamicOptions.options =
        roles.reduce(
          (options, { value, types }) => ({
            ...options,
            [value]: transformTypes(types)
          }),
          {}
        )
      return field
    } else return field
  })
}

const AuditDescriptionMapping: {
  [key: string]: MessageDescriptor
} = {
  IN_PROGRESS: messages.inProgressAuditAction,
  DECLARED: messages.declaredAuditAction,
  VALIDATED: messages.validatedAuditAction,
  DECLARATION_UPDATED: messages.updatedAuditAction,
  REGISTERED: messages.registeredAuditAction,
  REJECTED: messages.rejectedAuditAction,
  CERTIFIED: messages.certifiedAuditAction,
  ASSIGNED: messages.assignedAuditAction,
  UNASSIGNED: messages.unAssignedAuditAction,
  CORRECTED: messages.correctedAuditAction,
  ARCHIVED: messages.archivedAuditAction,
  LOGGED_IN: messages.loggedInAuditAction,
  LOGGED_OUT: messages.loggedOutAuditAction,
  PHONE_NUMBER_CHANGED: messages.phoneNumberChangedAuditAction,
  PASSWORD_CHANGED: messages.passwordChangedAuditAction,
  DEACTIVATE: messages.deactivateAuditAction,
  REACTIVATE: messages.reactivateAuditAction,
  EDIT_USER: messages.editUserAuditAction,
  CREATE_USER: messages.createUserAuditAction,
  PASSWORD_RESET: messages.passwordResetAuditAction,
  USERNAME_REMINDER: messages.userNameReminderAuditAction,
  USERNAME_REMINDER_BY_ADMIN: messages.usernameReminderByAdmin,
  PASSWORD_RESET_BY_ADMIN: messages.passwordResetByAdmin,
  RETRIEVED: messages.retrievedAuditAction,
  VIEWED: messages.viewedAuditAction,
  REINSTATED_IN_PROGRESS: messages.reInstatedInProgressAuditAction,
  REINSTATED_DECLARED: messages.reInstatedInReviewAuditAction,
  REINSTATED_REJECTED: messages.reInStatedRejectedAuditAction,
  SENT_FOR_APPROVAL: messages.sentForApprovalAuditAction
}

export function getUserAuditDescription(
  status: string
): MessageDescriptor | undefined {
  return AuditDescriptionMapping[status] || undefined
}

export function checkExternalValidationStatus(status?: string | null): boolean {
  return !(
    !window.config.EXTERNAL_VALIDATION_WORKQUEUE &&
    status === 'WAITING_VALIDATION'
  )
}

export function checkIfLocalLanguageProvided() {
  return window.config.LANGUAGES.split(',').length > 1
}

export function getUserSystemRole(
  user: { systemRole?: string | null },
  intl: IntlShape
): string | undefined {
  switch (user.systemRole) {
    case Roles.FIELD_AGENT:
      return intl.formatMessage(userMessages.FIELD_AGENT)
    case Roles.REGISTRATION_AGENT:
      return intl.formatMessage(userMessages.REGISTRATION_AGENT)
    case Roles.NATIONAL_REGISTRAR:
      return intl.formatMessage(userMessages.NATIONAL_REGISTRAR)
    case Roles.LOCAL_REGISTRAR:
      return intl.formatMessage(userMessages.LOCAL_REGISTRAR)
    case Roles.LOCAL_SYSTEM_ADMIN:
      return intl.formatMessage(userMessages.LOCAL_SYSTEM_ADMIN)
    case Roles.NATIONAL_SYSTEM_ADMIN:
      return intl.formatMessage(userMessages.NATIONAL_SYSTEM_ADMIN)
    case Roles.PERFORMANCE_MANAGEMENT:
      return intl.formatMessage(userMessages.PERFORMANCE_MANAGEMENT)
    default:
      return undefined
  }
}

export function getUserType(user: { role?: IUserRole }): string | undefined {
  if (user.role) {
    return user.role.labels.find((label) => label.lang === 'en')?.label
  } else {
    return undefined
  }
}

export const getUserRoleIntlKey = (_roleId: string) => {
  return `role.${_roleId}`
}
