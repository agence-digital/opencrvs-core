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
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { Check } from '@opencrvs/components/lib/icons'
import {
  ResponsiveModal,
  ActionPageLight
} from '@opencrvs/components/lib/interface'
import {
  IPrintableDeclaration,
  IDeclarationsState,
  modifyDeclaration,
  writeDeclaration,
  storeDeclaration,
  SUBMISSION_STATUS
} from '@opencrvs/client/src/declarations'
import { Action, Event, IForm, CorrectionSection } from '@client/forms'
import { constantsMessages } from '@client/i18n/messages'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import {
  goToRegistrarHomeTab as goToRegistrarHomeTabAction,
  goBack,
  goToCertificateCorrection
} from '@client/navigation'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { TAB_ID } from '@client/views/OfficeHome/tabs/inProgress/inProgressTab'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import { previewCertificate } from '@client/views/PrintCertificate/PDFUtils'
import { getEventRegisterForm } from '@client/forms/register/declaration-selectors'
import { IOfflineData } from '@client/offline/reducer'
import {
  getCountryTranslations,
  IAvailableCountries,
  isCertificateForPrintInAdvance,
  getEventDate,
  isFreeOfCost,
  calculatePrice,
  getRegisteredDate
} from './utils'
import { getOfflineData } from '@client/offline/selectors'
import { countries } from '@client/forms/countries'
import ReactToPrint, { PrintContextConsumer } from 'react-to-print'

export const ActionPageWrapper = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`

const CustomTertiaryButton = styled(TertiaryButton)`
  height: 48px;
  &:disabled {
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.grey300};
  }
`
const ButtonWrapper = styled.div`
  display: flex;

  button {
    margin-right: 10px;
  }
  button:last-child {
    margin-right: 0px;
  }
`
const SvgWrapper = styled.div`
  background: ${({ theme }) => theme.colors.grey100};
  display: flex;
  height: 100%;
  padding-top: 48px;
  padding-bottom: 48px;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
`
const Certificate = styled.img`
  display: block;
  ${({ theme }) => theme.shadows.light};
  width: 64%;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
`

const Info = styled.div`
  ${({ theme }) => theme.fonts.reg16};
  margin-bottom: 30px;
  color: ${({ theme }) => theme.colors.grey500};
  width: 80%;
`
const Title = styled.h4`
  ${({ theme }) => theme.fonts.h2};
  margin: 0 0 20px 0;
`

type State = {
  certificatePdf: string | null
  showConfirmationModal: boolean
}
type IProps = {
  event: Event
  registrationId: string
  draft: IPrintableDeclaration
  userDetails: IUserDetails | null
  countries: IAvailableCountries[]
  registerForm: IForm
  offlineCountryConfig: IOfflineData
  goBack: typeof goBack
  modifyDeclaration: typeof modifyDeclaration
  writeDeclaration: typeof writeDeclaration
  goToRegistrarHomeTabAction: typeof goToRegistrarHomeTabAction
  storeDeclaration: typeof storeDeclaration
  goToCertificateCorrection: typeof goToCertificateCorrection
}

type IFullProps = IntlShapeProps &
  RouteComponentProps<{}, {}, { isNavigatedInsideApp: boolean }> &
  IProps & { drafts: IDeclarationsState }

class ReviewCertificateActionComponent extends React.Component<
  IFullProps,
  State
> {
  componentRef: React.RefObject<HTMLImageElement>
  constructor(props: IFullProps) {
    super(props)
    this.componentRef = React.createRef()
    this.state = {
      certificatePdf: null,
      showConfirmationModal: false
    }
  }
  componentDidMount() {
    if (this.state.certificatePdf === null) {
      previewCertificate(
        this.props.intl,
        this.props.draft,
        this.props.userDetails,
        this.props.offlineCountryConfig,
        (svg: string) => {
          this.setState({
            certificatePdf: svg
          })
        },
        this.props.countries
      )
    }
  }

  toggleModal = () => {
    this.setState({
      showConfirmationModal: !this.state.showConfirmationModal
    })
  }

  readyToCertify = (printSvgCertificate: () => void) => {
    const { draft } = this.props
    draft.submissionStatus = SUBMISSION_STATUS.READY_TO_CERTIFY
    draft.action = Action.COLLECT_CERTIFICATE

    const registeredDate = getRegisteredDate(draft.data)
    const certificate = draft.data.registration.certificates[0]
    const eventDate = getEventDate(draft.data, draft.event)
    let submittableCertificate
    if (isCertificateForPrintInAdvance(draft)) {
      if (
        isFreeOfCost(
          draft.event,
          eventDate,
          registeredDate,
          this.props.offlineCountryConfig
        )
      ) {
        submittableCertificate = {}
      } else {
        const paymentAmount = calculatePrice(
          draft.event,
          eventDate,
          registeredDate,
          this.props.offlineCountryConfig
        )
        submittableCertificate = {
          payments: {
            type: 'MANUAL' as const,
            total: Number(paymentAmount),
            amount: Number(paymentAmount),
            outcome: 'COMPLETED' as const,
            date: Date.now()
          }
        }
      }
    } else {
      submittableCertificate = certificate
    }
    draft.data.registration = {
      ...draft.data.registration,
      certificates: [
        {
          ...submittableCertificate,
          data:
            this.state.certificatePdf === null ? '' : this.state.certificatePdf
        }
      ]
    }

    printSvgCertificate()
    this.props.modifyDeclaration(draft)
    this.props.writeDeclaration(draft)
    this.toggleModal()
    this.props.goToRegistrarHomeTabAction(TAB_ID.readyForPrint)
  }

  getTitle = () => {
    const { intl, event } = this.props
    let eventName = intl.formatMessage(constantsMessages.birth).toLowerCase()
    switch (event) {
      case Event.BIRTH:
        return intl.formatMessage(certificateMessages.reviewTitle, {
          event: eventName
        })
      case Event.DEATH:
        eventName = intl.formatMessage(constantsMessages.death).toLowerCase()
        return intl.formatMessage(certificateMessages.reviewTitle, {
          event: eventName
        })
      default:
        return intl.formatMessage(certificateMessages.reviewTitle, {
          event: eventName
        })
    }
  }

  goBack = () => {
    const historyState = this.props.location.state
    const navigatedFromInsideApp = Boolean(
      historyState && historyState.isNavigatedInsideApp
    )

    if (navigatedFromInsideApp) {
      this.props.goBack()
    } else {
      this.props.goToRegistrarHomeTabAction(TAB_ID.readyForPrint)
    }
  }

  render = () => {
    const { intl } = this.props

    return (
      <ActionPageLight
        id="collector_form"
        title={intl.formatMessage(
          certificateMessages.certificateCollectionTitle
        )}
        goBack={this.goBack}
      >
        <Title>{this.getTitle()}</Title>
        <Info>{intl.formatMessage(certificateMessages.reviewDescription)}</Info>
        <ReactToPrint content={() => this.componentRef.current}>
          <PrintContextConsumer>
            {({ handlePrint }) => (
              <>
                {this.state.certificatePdf && (
                  <SvgWrapper>
                    <Certificate
                      id="svgholder"
                      src={this.state.certificatePdf}
                      ref={this.componentRef}
                    />
                  </SvgWrapper>
                )}
                <ButtonWrapper>
                  <PrimaryButton
                    align={0}
                    id="confirm-print"
                    onClick={this.toggleModal}
                    icon={() => <Check />}
                  >
                    {intl.formatMessage(certificateMessages.confirmAndPrint)}
                  </PrimaryButton>
                  <CustomTertiaryButton
                    onClick={() =>
                      this.props.goToCertificateCorrection(
                        this.props.registrationId,
                        CorrectionSection.Corrector
                      )
                    }
                  >
                    {intl.formatMessage(buttonMessages.editRecord)}
                  </CustomTertiaryButton>
                </ButtonWrapper>
                <ResponsiveModal
                  id="confirm-print-modal"
                  title={intl.formatMessage(certificateMessages.modalTitle)}
                  actions={[
                    <CustomTertiaryButton
                      onClick={this.toggleModal}
                      id="close-modal"
                    >
                      {intl.formatMessage(buttonMessages.cancel)}
                    </CustomTertiaryButton>,
                    <PrimaryButton
                      onClick={() => this.readyToCertify(handlePrint)}
                      id="print-certificate"
                    >
                      {intl.formatMessage(buttonMessages.print)}
                    </PrimaryButton>
                  ]}
                  show={this.state.showConfirmationModal}
                  handleClose={this.toggleModal}
                  contentHeight={100}
                >
                  {intl.formatMessage(certificateMessages.modalBody)}
                </ResponsiveModal>
              </>
            )}
          </PrintContextConsumer>
        </ReactToPrint>
      </ActionPageLight>
    )
  }
}

const getEvent = (eventType: string | undefined) => {
  switch (eventType && eventType.toLowerCase()) {
    case 'birth':
    default:
      return Event.BIRTH
    case 'death':
      return Event.DEATH
  }
}

const getDraft = (
  drafts: IPrintableDeclaration[],
  registrationId: string,
  eventType: string
) =>
  drafts.find((draftItem) => draftItem.id === registrationId) ||
  ({
    id: '',
    data: {},
    event: getEvent(eventType)
  } as IPrintableDeclaration)

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ registrationId: string; eventType: string }>
) {
  const { registrationId, eventType } = props.match.params
  const declarations = state.declarationsState
    .declarations as IPrintableDeclaration[]

  const draft = getDraft(declarations, registrationId, eventType)
  const event = getEvent(draft.event)

  return {
    event,
    registrationId,
    draft,
    countries: getCountryTranslations(state.i18n.languages, countries),
    drafts: state.declarationsState,
    userDetails: getUserDetails(state),
    offlineCountryConfig: getOfflineData(state),
    registerForm: getEventRegisterForm(state, event)
  }
}
const mapDispatchToProps = {
  modifyDeclaration,
  writeDeclaration,
  goToRegistrarHomeTabAction,
  storeDeclaration,
  goBack,
  goToCertificateCorrection
}
export const ReviewCertificateAction = connect(
  mapStatetoProps,
  mapDispatchToProps
)(injectIntl<'intl', IFullProps>(ReviewCertificateActionComponent))
