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

export function createServerWithEnvironment(env: any) {
  jest.resetModules()
  process.env = { ...process.env, ...env }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../server').createServer()
}
export const translationsMock = {
  languages: [
    {
      lang: 'en',
      displayName: 'English',
      messages: {
        birthInProgressNotification:
          'Birth registration tracking ID is {{trackingId}}. You must visit {{crvsOffice}} to complete the declaration',
        birthDeclarationNotification:
          'Birth registration tracking ID for {{name}} is {{trackingId}}. You will get an SMS within 2 days with progress and next steps.',
        birthRegistrationNotification:
          'Congratulations, the birth of {{name}} has been registered. Visit your local registration office in 5 days with your ID to collect the certificate. Your tracking ID is {{trackingId}}.',
        birthRejectionNotification:
          'Birth registration declaration for {{name}} ( Tracking ID: {{trackingId}} ) has been rejected. Please visit your local registration office for more information.',
        deathInProgressNotification:
          'Death registration tracking ID is {{trackingId}}. You must visit {{crvsOffice}} to complete the declaration',
        deathDeclarationNotification:
          'Death registration tracking ID for {{name}} is {{trackingId}}. You will get an SMS within 2 days with progress and next steps.',
        deathRegistrationNotification:
          'The death of {{name}} has been registered. Visit your local registration office in 5 days with your ID to collect the certificate. Your tracking ID is {{trackingId}}.',
        deathRejectionNotification:
          'Death registration declaration for {{name}} ( Tracking ID: {{trackingId}} ) has been rejected. Please visit your local registration office for more information.',
        authenticationCodeNotification:
          'Your OpenCRVS authentication code is: {{authCode}}',
        userCredentialsNotification:
          'You can login to OpenCRVS with this temporary username: {{username}} and password: {{password}}',
        retieveUserNameNotification:
          'Your username for OpenCRVS is: {{username}}',
        updateUserNameNotification:
          'Your OpenCRVS username has been updated to: {{username}}. Your password has not changed.'
      }
    },
    {
      lang: 'bn',
      displayName: 'বাংলা',
      messages: {
        birthInProgressNotification:
          'জন্ম নিবন্ধন ট্র্যাকিং আইডি {{trackingId}}। আবেদনটি সম্পূর্ণ করতে {{crvsOffice}} এ আসুন।',
        birthDeclarationNotification:
          '{{name}} এর জন্য জন্ম নিবন্ধন ট্র্যাকিং আইডি {{trackingId}}। অগ্রগতি এবং পরবর্তী পদক্ষেপের সাথে আপনি 2 দিনের মধ্যে একটি এসএমএস পাবেন।',
        birthRegistrationNotification:
          'অভিনন্দন, {{name}} এর জন্ম নিবন্ধিত হয়েছে। সার্টিফিকেট সংগ্রহ করতে আপনার আইডি নিয়ে ৫ দিন পরে স্থানীয় নিবন্ধন অফিসে যান। আপনার ট্র্যাকিং আইডি হল {{trackingId}}।',
        birthRejectionNotification:
          '{{name}} এর জন্ম নিবন্ধন আবেদনটি (ট্র্যাকিং আইডি: {{trackingId}}) বাতিল করা হয়েছে। পরবর্তী পদক্ষেপের জন্য আপনার স্থানীয় নিবন্ধন অফিসে যান।',
        deathInProgressNotification:
          'মৃত্যু নিবন্ধন ট্র্যাকিং আইডি {{trackingId}}। আবেদনটি সম্পূর্ণ করতে {{crvsOffice}} এ আসুন।',
        deathDeclarationNotification:
          '{{name}} এর জন্য মৃত্যু নিবন্ধন ট্র্যাকিং আইডি {{trackingId}}। অগ্রগতি এবং পরবর্তী পদক্ষেপের সাথে আপনি 2 দিনের মধ্যে একটি এসএমএস পাবেন।',
        deathRegistrationNotification:
          '{{name}} এর মৃত্যু নিবন্ধিত হয়েছে। সার্টিফিকেট সংগ্রহ করতে আপনার আইডি নিয়ে ৫ দিন পরে স্থানীয় নিবন্ধন অফিসে যান। আপনার ট্র্যাকিং আইডি হল {{trackingId}}।',
        deathRejectionNotification:
          '{{name}} এর মৃত্যু নিবন্ধন আবেদনটি (ট্র্যাকিং আইডি: {{trackingId}}) বাতিল করা হয়েছে। পরবর্তী পদক্ষেপের জন্য আপনার স্থানীয় নিবন্ধন অফিসে যান।',
        authenticationCodeNotification:
          'আপনার OpenCRVS এর authentication code হল: {{authCode}}',
        userCredentialsNotification:
          'OpenCRVS এ লগইন করতে ব্যাবহার করুন, username: {{username}} এবং password: {{password}}',
        retieveUserNameNotification:
          'আপনার OpenCRVS এর username হল: {{username}}',
        updateUserNameNotification:
          'আপনার OpenCRVS এর বদলকৃত username হল: {{username}}। আপনার password এখনো অপরিবর্তিত রয়েছে।'
      }
    }
  ]
}
