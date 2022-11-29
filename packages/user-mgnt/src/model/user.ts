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
import { Document, model, Schema } from 'mongoose'
import { statuses } from '@user-mgnt/utils/userUtils'

export enum AUDIT_REASON {
  TERMINATED,
  SUSPICIOUS,
  ROLE_REGAINED,
  NOT_SUSPICIOUS,
  OTHER
}

export enum AUDIT_ACTION {
  DEACTIVATE,
  REACTIVATE,
  CERTIFICATE_CREATED,
  CERTIFICATE_UPDATED,
  CERTIFICATE_DELETED
}

export interface IUserName {
  use: string
  family: string
  given: string[]
}

export enum FIELD_AGENT_TYPES {
  HEALTHCARE_WORKER = 'HEALTHCARE_WORKER',
  POLICE_OFFICER = 'POLICE_OFFICER',
  SOCIAL_WORKER = 'SOCIAL_WORKER',
  LOCAL_LEADER = 'LOCAL_LEADER'
}

interface IIdentifier {
  system: string
  value: string
}
export interface ISecurityQuestionAnswer {
  questionKey: string
  answerHash: string
}
interface ISignature {
  type: string
  data: string
}
interface ILocalRegistrar {
  name: IUserName[]
  role?: string
  signature: ISignature
}
export interface IAuditHistory {
  auditedBy: string
  auditedOn: number
  action: string
  reason: string
  comment?: string
}
export interface IAvatar {
  type: string
  data: string
}
export interface IUser {
  name: IUserName[]
  username: string
  identifiers: IIdentifier[]
  email: string
  mobile: string
  passwordHash: string
  salt: string
  role: string
  type: FIELD_AGENT_TYPES
  practitionerId: string
  primaryOfficeId: string
  catchmentAreaIds: string[]
  scope: string[]
  signature: ISignature
  localRegistrar?: ILocalRegistrar
  status: string
  device?: string
  securityQuestionAnswers: ISecurityQuestionAnswer[]
  creationDate: number
  auditHistory: IAuditHistory[]
  avatar?: IAvatar
}

export interface IUserModel extends IUser, Document {}

export const UserNameSchema = new Schema(
  {
    use: String,
    given: [String],
    family: String
  },
  { _id: false }
)

const IdentifierSchema = new Schema(
  {
    system: String,
    value: String
  },
  { _id: false }
)

const SecurityQuestionAnswerSchema = new Schema(
  {
    questionKey: String,
    answerHash: String
  },
  { _id: false }
)

const AuditHistory = new Schema(
  {
    auditedBy: String,
    auditedOn: {
      type: Number,
      default: Date.now
    },
    action: {
      type: String,
      enum: [
        AUDIT_ACTION.DEACTIVATE,
        AUDIT_ACTION.REACTIVATE,
        AUDIT_ACTION.CERTIFICATE_CREATED,
        AUDIT_ACTION.CERTIFICATE_UPDATED,
        AUDIT_ACTION.CERTIFICATE_DELETED
      ],
      default: AUDIT_ACTION.DEACTIVATE
    },
    reason: {
      type: String,
      enum: [
        AUDIT_REASON.TERMINATED,
        AUDIT_REASON.SUSPICIOUS,
        AUDIT_REASON.ROLE_REGAINED,
        AUDIT_REASON.NOT_SUSPICIOUS,
        AUDIT_REASON.OTHER
      ],
      default: AUDIT_REASON.OTHER
    },
    comment: String
  },
  {
    _id: false
  }
)

const Avatar = new Schema(
  {
    type: String,
    data: String
  },
  {
    _id: false
  }
)

const userSchema = new Schema({
  name: { type: [UserNameSchema], required: true },
  username: { type: String, required: true },
  identifiers: [IdentifierSchema],
  email: { type: String },
  mobile: { type: String, unique: true },
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  role: String,
  type: String,
  practitionerId: { type: String, required: true },
  primaryOfficeId: { type: String, required: true },
  catchmentAreaIds: { type: [String], required: true },
  scope: { type: [String], required: true },
  status: {
    type: String,
    enum: [
      statuses.PENDING,
      statuses.ACTIVE,
      statuses.DISABLED,
      statuses.DEACTIVATED
    ],
    default: statuses.PENDING
  },
  securityQuestionAnswers: [SecurityQuestionAnswerSchema],
  device: String,
  creationDate: { type: Number, default: Date.now },
  auditHistory: [AuditHistory],
  avatar: Avatar
})

export default model<IUserModel>('User', userSchema)
