import { configManager, hawtio, HawtioInitialization } from '@hawtio/react/init'
import React from 'react'
import ReactDOM from 'react-dom/client'

const hawtioVersion = '__HAWTIO_VERSION_PLACEHOLDER__'

// Configure the console version
configManager.addProductInfo('Hawtio', hawtioVersion)

// Set up plugin location
hawtio.addUrl('plugin')

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<HawtioInitialization verbose={false} />)

import('@hawtio/react').then(async m => {
  const log = m.Logger.get('hawtio-console')
  log.info('Hawtio minimal console:', hawtioVersion)

  // Register minimum builtin plugins
  m.keycloak()
  m.oidc()
  m.connect()
  m.rbac()
  m.jmx()

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
