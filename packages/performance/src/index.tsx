import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Sentry from '@sentry/browser'
import * as LogRocket from 'logrocket'
import { App } from '@performance/App'
import { createStore } from '@performance/store'
import { injectGlobal } from '@performance/styledComponents'

// Injecting global styles for the body tag - used only once
// tslint:disable-next-line
injectGlobal`
  body {
    margin: 0;
    padding: 0;
  }
`
const { store, history } = createStore()

if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  // setup error reporting using sentry
  Sentry.init({
    dsn: 'https://8f6ba426b20045f1b91528d5fdc214b5@sentry.io/1401900'
  })

  // setup log rocket to ship log messages and record user errors
  LogRocket.init('hxf1hb/opencrvs')

  // Integrate the two
  Sentry.configureScope(scope => {
    scope.addEventProcessor(async event => {
      if (!event.extra) {
        event.extra = {}
      }
      const sessionUrl = await new Promise(resolve => {
        LogRocket.getSessionURL(url => {
          resolve(url)
        })
      })
      event.extra.sessionURL = sessionUrl
      return event
    })
  })
}

ReactDOM.render(
  <App store={store} history={history} />,
  document.getElementById('root')
)
