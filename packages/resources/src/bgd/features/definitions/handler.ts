import * as Hapi from 'hapi'
import { getForms, IForms } from '@resources/bgd/features/forms/service'
import {
  getLanguages,
  ILanguage
} from '@resources/bgd/features/languages/service/service'

interface IDefinitionsResponse {
  forms: IForms
  languages: ILanguage[]
  timestamp: string
}

export async function definitionsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IDefinitionsResponse> {
  const application = request.params.application
  return {
    forms: await getForms(),
    languages: (await getLanguages(application)).data,
    timestamp: ''
  }
}
