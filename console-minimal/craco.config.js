const path = require('path')
const { ModuleFederationPlugin } = require('webpack').container
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const CracoEsbuildPlugin = require('craco-esbuild')
const { dependencies } = require('./package.json')
const { hawtioBackend } = require('@hawtio/backend-middleware')

module.exports = {
  plugins: [{ plugin: CracoEsbuildPlugin }],
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
          // 'html' is required as workaround for 'xml'
          // https://github.com/microsoft/monaco-editor/issues/1509
          languages: ['xml', 'json', 'html', 'plaintext'],
          globalAPI: true,
        }),
      ],
    },
    configure: webpackConfig => {
      // Required for Module Federation
      webpackConfig.output.publicPath = 'auto'

      webpackConfig.ignoreWarnings = [
        // For suppressing sourcemap warnings coming from some dependencies
        /Failed to parse source map/,
        /Critical dependency: the request of a dependency is an expression/,
      ]

      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          path: require.resolve('path-browserify'),
          os: require.resolve('os-browserify'),
        },
      }

      // Tweak ModuleScopePlugin for allowing aliases outside of src
      const moduleScopePlugin = webpackConfig.resolve.plugins.find(p => p.constructor.name === 'ModuleScopePlugin')
      if (moduleScopePlugin) {
        moduleScopePlugin.allowedPaths.push(path.resolve(__dirname, 'node_modules/react'))
      }

      // MiniCssExtractPlugin - Ignore order as otherwise conflicting order warning is raised
      const miniCssExtractPlugin = webpackConfig.plugins.find(p => p.constructor.name === 'MiniCssExtractPlugin')
      if (miniCssExtractPlugin) {
        miniCssExtractPlugin.options.ignoreOrder = true
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
      // Redirect / or /hawtio to /hawtio/
      devServer.app.get('/', (_, res) => res.redirect('/hawtio/'))
      devServer.app.get('/hawtio$', (_, res) => res.redirect('/hawtio/'))

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
      // Keycloak
      const keycloakEnabled = false
      const keycloakClientConfig = {
        realm: 'hawtio-demo',
        clientId: 'hawtio-client',
        url: 'http://localhost:18080/',
        jaas: false,
        pkceMethod: 'S256',
      }

      // Hawtio backend API mock
      let authenticated = true
      devServer.app.get('/hawtio/user', (_, res) => {
        if (authenticated) {
          res.send(`"${username}"`)
        } else {
          res.sendStatus(403)
        }
      })
      devServer.app.post('/hawtio/auth/login', (_, res) => {
        authenticated = true
        res.send(String(login))
      })
      devServer.app.get('/hawtio/auth/logout', (_, res) => {
        authenticated = false
        res.redirect('/hawtio/login')
      })
      devServer.app.get('/hawtio/proxy/enabled', (_, res) => res.send(String(proxyEnabled)))
      devServer.app.get('/hawtio/plugin', (_, res) => res.send(JSON.stringify(plugin)))
      devServer.app.get('/hawtio/keycloak/enabled', (_, res) => res.send(String(keycloakEnabled)))
      devServer.app.get('/hawtio/keycloak/client-config', (_, res) => res.send(JSON.stringify(keycloakClientConfig)))
      devServer.app.get('/hawtio/keycloak/validate-subject-matches', (_, res) => res.send('true'))

      // Hawtio backend middleware should be run before other middlewares (thus 'unshift')
      // in order to handle GET requests to the proxied Jolokia endpoint.
      middlewares.unshift({
        name: 'hawtio-backend',
        path: '/hawtio/proxy',
        middleware: hawtioBackend({
          // Uncomment it if you want to see debug log for Hawtio backend
          logLevel: 'debug',
        }),
      })

      return middlewares
    },
  },
}
