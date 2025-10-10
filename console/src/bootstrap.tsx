import React from 'react'
import ReactDOM from 'react-dom/client'

import { configManager, hawtio, HawtioInitialization, TaskState, Logger } from '@hawtio/react/init'

configManager.initItem('Loading UI', TaskState.started, 'config')

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(<HawtioInitialization verbose={configManager.globalLogLevel() < Logger.INFO.value} />)

// Configure the console version
const hawtioVersion = '__HAWTIO_VERSION_PLACEHOLDER__'
configManager.addProductInfo('Hawtio', hawtioVersion)

// Set up plugin location
hawtio.addUrl('plugin')

import('@hawtio/react').then(async m => {
  const log = m.Logger.get('hawtio-console')
  log.info('Hawtio console:', hawtioVersion)

  // Register builtin plugins
  m.registerPlugins()

  configManager.initItem('Loading UI', TaskState.finished, 'config')

  // Bootstrap Hawtio
  m.hawtio.bootstrap().then(() => {
    import('@hawtio/react/ui').then(ui => {
      root.render(
        <React.StrictMode>
          <ui.Hawtio />
        </React.StrictMode>,
      )
    })
  })
})
