import React from 'react'
import ReactDOM from 'react-dom/client'

import { configManager, hawtio, HawtioInitialization, Logger, TaskState } from '@hawtio/react/init'

configManager.initItem('Loading UI', TaskState.started, 'config')

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(<HawtioInitialization verbose={configManager.globalLogLevel() < Logger.INFO.value} />)

// Configure the console version
const hawtioVersion = '__HAWTIO_VERSION_PLACEHOLDER__'
configManager.addProductInfo('Hawtio', hawtioVersion)

// Set up plugin location
hawtio.addUrl('plugin')

import('@hawtio/react').then(async ({ Logger, registerPlugins, hawtio }) => {
  const log = Logger.get('hawtio-console')
  log.info('Hawtio console:', hawtioVersion)

  // Register builtin plugins
  registerPlugins()

  configManager.initItem('Loading UI', TaskState.finished, 'config')

  // Bootstrap Hawtio
  hawtio.bootstrap().then(() => {
    import('@hawtio/react/ui').then(({ Hawtio }) => {
      root.render(
        <React.StrictMode>
          <Hawtio />
        </React.StrictMode>,
      )
    })
  })
})
