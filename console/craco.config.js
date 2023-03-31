const path = require('path')
const { hawtioBackend } = require('@hawtio/backend-middleware')

module.exports = {
  webpack: {
    alias: {
      // Required when doing `yarn link`
      react: path.resolve(__dirname, 'node_modules/react'),
    },
    configure: webpackConfig => {
      webpackConfig.ignoreWarnings = [
        // For suppressing sourcemap warnings coming from superstruct
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes('node_modules') &&
            warning.details &&
            warning.details.includes('source-map-loader')
          )
        },
      ]

      // Tweak ModuleScopePlugin for allowing aliases outside of src
      const moduleScopePlugin = webpackConfig.resolve.plugins.find(p => p.constructor.name === 'ModuleScopePlugin')
      if (moduleScopePlugin) {
        moduleScopePlugin.allowedPaths.push(path.resolve(__dirname, 'node_modules/react'))
      }

      return webpackConfig
    },
  },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // Redirect / to /hawtio/
      devServer.app.get('/', (req, res) => res.redirect('/hawtio/'))

      const username = 'developer'
      const login = true
      const proxyEnabled = true
      const plugin = []

      // Hawtio backend API mock
      devServer.app.get('/hawtio/user', (req, res) => res.send(`"${username}"`))
      devServer.app.post('/hawtio/auth/login', (req, res) => res.send(String(login)))
      devServer.app.get('/hawtio/auth/logout', (req, res) => res.redirect('/hawtio/login'))
      devServer.app.get('/hawtio/proxy/enabled', (req, res) => res.send(String(proxyEnabled)))
      devServer.app.get('/hawtio/plugin', (req, res) => res.send(JSON.stringify(plugin)))

      middlewares.push({
        name: 'hawtio-backend',
        path: '/proxy',
        middleware: hawtioBackend({
          // Uncomment it if you want to see debug log for Hawtio backend
          logLevel: 'debug',
        }),
      })

      return middlewares
    },
  },
}
