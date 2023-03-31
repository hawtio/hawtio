const path = require('path')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const { dependencies } = require('./package.json')
const { hawtioBackend } = require('@hawtio/backend-middleware')

module.exports = {
  webpack: {
    alias: {
      // Required when doing `yarn link`
      react: path.resolve(__dirname, 'node_modules/react'),
    },
    plugins: {
      add: [
        new ModuleFederationPlugin({
          name: 'hawtio',
          shared: {
            ...dependencies,
            react: {
              singleton: true,
              requiredVersion: dependencies['react'],
            },
            'react-dom': {
              singleton: true,
              requiredVersion: dependencies['react-dom'],
            },
            'react-router-dom': {
              singleton: true,
              requiredVersion: dependencies['react-router-dom'],
            },
            '@hawtio/react': {
              singleton: true,
              requiredVersion: dependencies['@hawtio/react'],
            },
          },
        }),
        new MonacoWebpackPlugin({
          languages: ['xml'],
          globalAPI: true,
        }),
      ],
    },
    configure: webpackConfig => {
      // Required for Module Federation
      webpackConfig.output.publicPath = 'auto'

      // For suppressing sourcemap warnings coming from some dependencies
      webpackConfig.ignoreWarnings = [/Failed to parse source map/]

      // Tweak ModuleScopePlugin for allowing aliases outside of src
      const moduleScopePlugin = webpackConfig.resolve.plugins.find(p => p.constructor.name === 'ModuleScopePlugin')
      if (moduleScopePlugin) {
        moduleScopePlugin.allowedPaths.push(path.resolve(__dirname, 'node_modules/react'))
      }

      // ***** Debugging *****
      const fs = require('fs')
      const util = require('node:util')
      const out = `output = ${util.inspect(webpackConfig.output)}\n\nplugins = ${util.inspect(webpackConfig.plugins)}`
      fs.mkdir(
        'target',
        { recursive: true },
        err => !err && fs.writeFile('target/__webpackConfig__.txt', out, err => err && console.error(err)),
      )
      // ***** Debugging *****

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
      const plugin = [
        // Uncomment to test remote plugins loading
        /*
        {
          url: 'http://localhost:3001',
          scope: 'samplePlugin',
          module: './plugin',
        },
        */
      ]

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
