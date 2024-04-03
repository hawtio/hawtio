import { configManager, hawtio, Hawtio, Logger, registerPlugins } from '@hawtio/react'
import React from 'react'
import ReactDOM from 'react-dom/client'

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
