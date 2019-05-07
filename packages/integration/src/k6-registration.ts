import { group, check } from 'k6'
import { post } from 'k6/http'
import genReg from './gen-registration.js'
import { API_URL } from './constants.js'
import { fetchToken } from './utils.js'

export const options = {
  vus: 10,
  duration: '30s'
}

export function setup() {
  return {
    registrarToken: fetchToken('+8801733333333', 'test')
  }
}

export default data => {
  group('Birth Registration', () => {
    const reg = genReg({ femaleRate: 0.45 })
    const res = post(API_URL, JSON.stringify(reg), {
      headers: {
        'Content-Type': 'application/fhir+json',
        Authorization: `Bearer ${data.registrarToken}`
      }
    })
    check(res, {
      'is status 200': r => r.status === 200
    })
  })
}
