import { ORG_URL } from '@resources/constants'
import {
  getLocationIDByDescription,
  getUpazilaID,
  getFromFhir,
  sendToFhir,
  titleCase
} from '@resources/bgd/features/utils'
import chalk from 'chalk'
import { logger } from '@resources/logger'

interface ITestPractitioner {
  division: string
  district: string
  upazila: string
  union: string
  A2IReference: string
  facilityEnglishName: string
  facilityBengaliName: string
  givenNamesBengali: string
  givenNamesEnglish: string
  familyNameBengali: string
  familyNameEnglish: string
  gender: string
  role: string
  mobile: string
  email: string
  signature?: string
}

const composeFhirPractitioner = (practitioner: ITestPractitioner): any => {
  return {
    resourceType: 'Practitioner',
    identifier: [
      {
        use: 'official',
        system: 'mobile',
        value: practitioner.mobile
      }
    ],
    telecom: [{ system: 'phone', value: practitioner.mobile }],
    name: [
      {
        use: 'en',
        family: [practitioner.familyNameEnglish],
        given: practitioner.givenNamesEnglish.split(' ')
      },
      {
        use: 'bn',
        family: [practitioner.familyNameBengali],
        given: practitioner.givenNamesBengali.split(' ')
      }
    ],
    gender: practitioner.gender,
    extension: practitioner.signature
      ? [
          {
            url: 'http://opencrvs.org/specs/extension/employee-signature',
            valueSignature: {
              type: [
                {
                  system: 'urn:iso-astm:E1762-95:2013',
                  code: '1.2.840.10065.1.12.1.13',
                  display: 'Review Signature'
                }
              ],
              when: new Date().toISOString(),
              contentType: 'image/png',
              blob: practitioner.signature
            }
          }
        ]
      : []
  }
}

const composeFhirPractitionerRole = (
  role: string,
  practitioner: string,
  location: fhir.Reference[]
): fhir.PractitionerRole => {
  return {
    resourceType: 'PractitionerRole',
    practitioner: {
      reference: practitioner
    },
    code: [
      {
        coding: [
          {
            system: `${ORG_URL}/specs/roles`,
            code: role
          }
        ]
      }
    ],
    location
  }
}
export async function composeAndSavePractitioners(
  practitioners: ITestPractitioner[],
  divisions: fhir.Location[],
  districts: fhir.Location[],
  upazilas: fhir.Location[],
  unions: fhir.Location[]
): Promise<boolean> {
  for (const practitioner of practitioners) {
    // Get Locations
    const locations: fhir.Reference[] = []
    if (practitioner.facilityEnglishName) {
      const facility = await getFromFhir(
        `/Location?name=${titleCase(
          encodeURIComponent(practitioner.facilityEnglishName)
        )}`
      )
      const facilityResource = facility.entry[0].resource
      locations.push({ reference: `Location/${facilityResource.id}` })
    }
    if (practitioner.division) {
      const practitionerDivision: fhir.Location = divisions.find(division => {
        return division.name === titleCase(practitioner.division)
      }) as fhir.Location
      locations.push({ reference: `Location/${practitionerDivision.id}` })
    }
    if (practitioner.district) {
      const practitionerDistrict: fhir.Location = districts.find(district => {
        return district.name === titleCase(practitioner.district)
      }) as fhir.Location
      locations.push({ reference: `Location/${practitionerDistrict.id}` })
    }
    if (practitioner.upazila) {
      const upazilaID = await getUpazilaID(upazilas, practitioner.upazila)
      locations.push({ reference: `Location/${upazilaID as string}` })
    }
    if (practitioner.union) {
      const unionID = getLocationIDByDescription(
        unions,
        practitioner.A2IReference
      )
      locations.push({ reference: `Location/${unionID as string}` })
    }

    logger.info(
      'Attaching the following locations: ' + JSON.stringify(locations)
    )

    // Create and save Practitioner
    const newPractitioner: fhir.Practitioner = composeFhirPractitioner(
      practitioner
    )
    const savedPractitionerResponse = await sendToFhir(
      newPractitioner,
      '/Practitioner',
      'POST'
    ).catch(err => {
      throw Error('Cannot save practitioner to FHIR')
    })

    const practitionerLocationHeader = savedPractitionerResponse.headers.get(
      'location'
    ) as string
    const practitionerReference = `Practitioner/${
      practitionerLocationHeader.split('/')[3]
    }`

    logger.info(`Practitioner saved to fhir: ${practitionerReference}`)

    // Create and save PractitionerRole
    const newPractitionerRole: fhir.PractitionerRole = composeFhirPractitionerRole(
      practitioner.role,
      practitionerReference,
      locations
    )

    const savedPractitionerRoleResponse = await sendToFhir(
      newPractitionerRole,
      '/PractitionerRole',
      'POST'
    ).catch(err => {
      throw Error('Cannot save practitioner role to FHIR')
    })

    const practitionerRoleLocationHeader = savedPractitionerRoleResponse.headers.get(
      'location'
    ) as string
    const practitionerRoleReference = `PractitionerRole/${
      practitionerRoleLocationHeader.split('/')[3]
    }`

    logger.info(`PractitionerRole saved to fhir: ${practitionerRoleReference}`)
  }

  logger.info(
    `${chalk.blueBright(
      '/////////////////////////// FINISHED SAVING RESOURCES - THANK YOU FOR WAITING ///////////////////////////'
    )}`
  )
  return true
}
