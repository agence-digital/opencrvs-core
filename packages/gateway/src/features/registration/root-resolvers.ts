import fetch from 'node-fetch'
import { fhirUrl, WORKFLOW_SERVICE_URL } from 'src/constants'
import { buildFHIRBundle } from 'src/features/registration/fhir-builders'
import { GQLResolver } from 'src/graphql/schema'
import { getFromFhir } from 'src/features/fhir/utils'

const statusMap = {
  declared: 'preliminary',
  registered: 'final'
}

export const resolvers: GQLResolver = {
  Query: {
    async listBirthRegistrations(_, { status, locationIds }) {
      if (locationIds) {
        return getCompositionsByLocation(locationIds)
      }
      const res = await fetch(
        `${fhirUrl}/Composition${
          status ? `?status=${statusMap[status]}&` : '?'
        }_count=0`,
        {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        }
      )

      const bundle = await res.json()

      return bundle.entry.map((entry: { resource: {} }) => entry.resource)
    }
  },

  Mutation: {
    async createBirthRegistration(_, { details }, authHeader) {
      const doc = await buildFHIRBundle(details)

      const res = await fetch(
        `${WORKFLOW_SERVICE_URL}createBirthRegistration`,
        {
          method: 'POST',
          body: JSON.stringify(doc),
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        }
      )

      if (!res.ok) {
        throw new Error(
          `Workflow post to /createBirthRegistration failed with [${
            res.status
          }] body: ${await res.text()}`
        )
      }

      const resBody = await res.json()
      if (!resBody || !resBody.trackingid) {
        throw new Error(`Workflow response did not send a valid response`)
      }
      // return the trackingid
      return resBody.trackingid
    }
  }
}

async function getCompositionsByLocation(locationIds: Array<string | null>) {
  const tasksResponses = await Promise.all(
    locationIds.map(locationId => {
      return getFromFhir(`/Task?location=${locationId}`)
    })
  )

  const compositions = await Promise.all(
    tasksResponses.map(tasksResponse => {
      return getComposition(tasksResponse)
    })
  )

  const flattened = compositions.reduce((a, b) => a && a.concat(b), [])

  const filteredComposition =
    flattened && flattened.filter(composition => composition !== undefined)
  return filteredComposition
}

async function getComposition(tasksResponse: fhir.Bundle) {
  return (
    tasksResponse.entry &&
    (await Promise.all(
      tasksResponse.entry.map((task: fhir.BundleEntry) => {
        const resource = task.resource as fhir.Task
        return resource.focus && getFromFhir(`/${resource.focus.reference}`)
      })
    ))
  )
}
