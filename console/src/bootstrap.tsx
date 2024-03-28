import { configManager, hawtio, Hawtio, Logger, registerPlugins } from '@hawtio/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { reportWebVitals } from './reportWebVitals'

const hawtioVersion = '__HAWTIO_VERSION_PLACEHOLDER__'

const log = Logger.get('hawtio-console')
log.info('Hawtio console:', hawtioVersion)

// Register builtin plugins
registerPlugins()

hawtio
  // Set up plugin location
  .addUrl('plugin')
  // Bootstrap Hawtio
  .bootstrap()

// Configure the console version
configManager.addProductInfo('Hawtio', hawtioVersion)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Hawtio />
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
