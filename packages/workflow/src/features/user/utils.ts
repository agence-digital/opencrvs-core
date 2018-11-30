import { USER_MGNT_SERVICE_URL } from 'src/constants'
import fetch from 'node-fetch'
import { callingCountries } from 'country-data'
import { logger } from 'src/logger'
import {
  JURISDICTION_TYPE_DISTRICT,
  JURISDICTION_TYPE_UNION,
  JURISDICTION_TYPE_UPAZILA
} from './constants'
import { COUNTRY } from 'src/constants'
import { getTokenPayload } from 'src/utils/authUtils.ts'
import { getFromFhir } from 'src/features/registration/fhir/fhir-utils'

export async function getUserMobile(
  userId: string,
  authHeader: { Authorization: string }
) {
  try {
    const res = await fetch(`${USER_MGNT_SERVICE_URL}getUserMobile`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
    const body = await res.json()

    return body
  } catch (err) {
    logger.error(`Unable to retrieve mobile for error : ${err}`)
  }
}

export const convertToLocal = (
  mobileWithCountryCode: string,
  countryCode: string
) => {
  countryCode = countryCode.toUpperCase()
  return mobileWithCountryCode.replace(
    callingCountries[countryCode].countryCallingCodes[0],
    '0'
  )
}

export async function getLoggedInPractitionerPrimaryLocation(
  token: string
): Promise<fhir.Location> {
  return getPrimaryLocationFromLocationList(
    await getLoggedInPractitionerLocations(token)
  )
}

export async function getPractitionerPrimaryLocation(
  practitionerId: string
): Promise<fhir.Location> {
  return getPrimaryLocationFromLocationList(
    await getPractitionerLocations(practitionerId)
  )
}

function getPrimaryLocationFromLocationList(
  locations: [fhir.Location]
): fhir.Location {
  if (!locations) {
    throw new Error('No location found for loggedin practitioner')
  }
  const primaryOffice = locations.find(location => {
    if (
      location.physicalType &&
      location.physicalType.coding &&
      location.physicalType.coding[0].display
    ) {
      return location.physicalType.coding[0].display === 'Building'
    }
    return false
  })
  if (!primaryOffice) {
    throw new Error('No primary office found for logged in practitioner')
  }
  return primaryOffice
}

export async function getLoggedInPractitionerLocations(
  token: string
): Promise<[fhir.Location]> {
  const practitionerResource = await getLoggedInPractitionerResource(token)

  if (!practitionerResource.id) {
    throw new Error("Practioner's ID not found")
  }
  /* getting location list for practitioner */
  return await getPractitionerLocations(practitionerResource.id)
}

export async function getLoggedInPractitionerResource(
  token: string
): Promise<fhir.Practitioner> {
  const tokenPayload = getTokenPayload(token)
  const userMobileResponse = await getUserMobile(tokenPayload.sub, {
    Authorization: `Bearer ${token}`
  })
  const localMobile = convertToLocal(userMobileResponse.mobile, COUNTRY)
  const practitionerBundle = await getFromFhir(
    `/Practitioner?telecom=phone|${localMobile}`
  )
  if (
    !practitionerBundle ||
    !practitionerBundle.entry ||
    !practitionerBundle.entry[0].resource
  ) {
    throw new Error('Practitioner resource not found')
  }
  return practitionerBundle.entry[0].resource
}

export async function getPractitionerLocations(
  practitionerId: string
): Promise<[fhir.Location]> {
  const roleResponse = await getFromFhir(
    `/PractitionerRole?practitioner=${practitionerId}`
  )
  const roleEntry = roleResponse.entry[0].resource
  if (!roleEntry || !roleEntry.location) {
    throw new Error('PractitionerRole has no locations associated')
  }
  const locList = []
  for (const location of roleEntry.location) {
    const splitRef = location.reference.split('/')
    const locationResponse: fhir.Location = await getFromFhir(
      `/Location/${splitRef[1]}`
    )
    if (!locationResponse) {
      throw new Error(`Location not found for ${location}`)
    }
    locList.push(locationResponse)
  }
  return locList as [fhir.Location]
}

export function getJurisDictionalLocations() {
  return [
    {
      jurisdictionType: JURISDICTION_TYPE_DISTRICT,
      bbsCode: ''
    },
    {
      jurisdictionType: JURISDICTION_TYPE_UPAZILA,
      bbsCode: ''
    },
    {
      jurisdictionType: JURISDICTION_TYPE_UNION,
      bbsCode: ''
    }
  ]
}

export function getPractitionerName(practitioner: fhir.Practitioner): string {
  if (!practitioner || !practitioner.name) {
    throw new Error('Invalid practitioner data found')
  }
  return ''
}
