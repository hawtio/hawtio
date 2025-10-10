const { ModuleFederationPlugin } = require('webpack').container
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const { dependencies } = require('./package.json')
const { hawtioBackend } = require('@hawtio/backend-middleware')
const path = require('path')
const bodyParser = require('body-parser')

const publicPath = '/hawtio'
const outputPath = path.resolve(__dirname, 'build')

const port = 3001

module.exports = (_, args) => {
  const isProduction = args.mode === 'production'
  return [
    // this is the "main" webpack configuration which builds entire application
    {
      entry: './src/index',

      /*
       * To debug in development with source maps * update accordingly
       *
       * For other alternatives see * https://webpack.js.org/configuration/devtool
       */
      devtool: isProduction ? 'source-map' : false,
      plugins: [
        new ModuleFederationPlugin({
          // _host_ is an application that can:
          //  - consume modules from "remotes" provided by other _hosts_ (ContainerReferencePlugin)
          //  - provide modules from "exposes" to be consumed by other _hosts_ (ContainerPlugin).
          //
          // "name" is required only if the _host_ uses "exposes" and it creates:
          // "webpack/container/entry/app" module
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
            '@patternfly/react-core': {
              singleton: true,
              requiredVersion: dependencies['@patternfly/react-core'],
            },
          },
        }),
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, 'public/index.html'),
          favicon: path.resolve(__dirname, 'public/favicon.ico'),
          // Trailing slash is really important for proper base path handling
          base: publicPath + '/',
          publicPath,
        }),
        new CopyWebpackPlugin({
          patterns: [
            {
              from: '**/*',
              to: outputPath,
              context: 'public/',
              globOptions: {
                gitignore: true,
                ignore: ['**/index.html', '**/favicon.ico'],
              },
            },
          ],
        }),
        new MonacoWebpackPlugin({
          // 'html' is required as workaround for 'xml'
          // https://github.com/microsoft/monaco-editor/issues/1509
          languages: ['xml', 'json', 'html'],
          globalAPI: true,
        }),
      ],
      output: {
        clean: true,
        path: outputPath,
        publicPath: 'auto',
        filename: isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js',
        chunkFilename: isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
        assetModuleFilename: 'static/media/[name].[hash][ext]',
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'swc-loader',
              options: {
                jsc: {
                  parser: {
                    syntax: 'typescript',
                  },
                },
              },
            },
          },
          {
            test: /\.js$/,
            enforce: 'pre',
            use: ['source-map-loader'],
          },
          {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset/resource',
          },
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: 'asset/resource',
          },
          {
            test: /\.md$/i,
            type: 'asset/source',
          },
        ],
      },
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        symlinks: false,
        alias: {
          '@thumbmarkjs/thumbmarkjs': path.join(__dirname, './node_modules/@thumbmarkjs/thumbmarkjs/dist/thumbmark.esm.js'),
        },
      },
      ignoreWarnings: [
        // For suppressing sourcemap warnings coming from some dependencies
        /Failed to parse source map/,
        /Critical dependency: the request of a dependency is an expression/,
      ],
      performance: {
        maxAssetSize: 1000000, // 1MB for now
      },
      devServer: {
        port: port,
        static: path.join(__dirname, 'public'),
        historyApiFallback: {
          // Needed to fallback to bundled index instead of public/index.html template
          index: publicPath,
        },
        hot: !process.env.DISABLE_WS,
        liveReload: !process.env.DISABLE_WS,
        // changing to "ws" adds 20+ more modules to webpack-generated bundle
        webSocketServer: process.env.DISABLE_WS ? false : 'ws',
        devMiddleware: {
          publicPath,
          writeToDisk: true,
        },
        setupMiddlewares: (middlewares, devServer) => {
          // handle incoming JSON mime data, so handlers have access to JSONified req.body
          devServer.app.use(bodyParser.json())

          // Redirect / or /hawtio to /hawtio/
          if (publicPath && publicPath !== '/') {
            devServer.app.get('/', (_, res) => res.redirect(`${publicPath}/`))
            devServer.app.get(`${publicPath}$`, (_, res) => res.redirect(`${publicPath}/`))
          }

          /* Hawtio userinfo / login / logout mock endpoints */

          let login = true
          let username = 'developer'
          devServer.app.get(`${publicPath}/user`, (_, res) => {
            if (login) {
              res.send(`"${username}"`)
            } else {
              res.sendStatus(403)
            }
          })
          devServer.app.post(`${publicPath}/auth/login`, (req, res) => {
            // Test authentication throttling with username 'throttled'
            const cred = req.body
            if (cred.username === 'throttled') {
              res.append('Retry-After', '10') // 10 secs
              res.sendStatus(429)
              return
            }

            login = true
            username = cred.username
            res.send(String(login))
          })
          devServer.app.get(`${publicPath}/auth/logout`, (_, res) => {
            login = false
            username = null
            res.redirect(`${publicPath}/login`)
          })

          /* Testing preset connections */

          // devServer.app.get(`${publicPath}/preset-connections`, (_, res) => {
          //   res.type('application/json')
          //   res.send(
          //     JSON.stringify([
          //       { name: 'test1', scheme: 'http', host: 'localhost', port: 8778, path: '/jolokia/' },
          //       { name: 'test2' },
          //     ]),
          //   )
          // })

          /* Configuration endpoints - global and for plugins */

          const proxyEnabled = true
          devServer.app.get(`${publicPath}/proxy/enabled`, (_, res) => {
            res.send(String(proxyEnabled))
          })

          devServer.app.get(`${publicPath}/auth/config/session-timeout`, (_, res) => {
            res.type('application/json')
            res.send('{ timeout: -1 }')
          })

          /* Available plugins - for Module Federation plugins not handled by Webpack at build time */

          const plugin = [
            // Uncomment to test remote plugins loading
            //{
            //  url: `http://localhost:${port}`,
            //  scope: 'samplePlugin',
            //  module: './plugin',
            //},
          ]
          devServer.app.get(`${publicPath}/plugin`, (_, res) => {
            res.send(JSON.stringify(plugin))
          })

          /* Keycloak */

          const keycloakEnabled = false
          const keycloakClientConfig = {
            realm: 'hawtio-demo',
            clientId: 'hawtio-client',
            url: 'http://localhost:18080/',
            jaas: false,
            pkceMethod: 'S256',
          }
          devServer.app.get(`${publicPath}/keycloak/enabled`, (_, res) => {
            res.send(String(keycloakEnabled))
          })
          devServer.app.get(`${publicPath}/keycloak/client-config`, (_, res) => {
            res.send(JSON.stringify(keycloakClientConfig))
          })
          devServer.app.get(`${publicPath}/keycloak/validate-subject-matches`, (_, res) => {
            res.send('true')
          })

          /* OpenID Connect */

          const oidcEnabled = true
          //const entraIDOidcConfig = {
          //  method: 'oidc',
          //  provider: 'https://login.microsoftonline.com/11111111-2222-3333-4444-555555555555/v2.0',
          //  client_id: '66666666-7777-8888-9999-000000000000',
          //  response_mode: 'fragment',
          //  scope: 'openid email profile api://hawtio-server/Jolokia.Access',
          //  redirect_uri: `http://localhost:${port}/hawtio/`,
          //  code_challenge_method: 'S256',
          //  prompt: null
          //  // prompt: 'login',
          //}
          const keycloakOidcConfig = {
            // configuration suitable for Keycloak run from https://github.com/hawtio/hawtio
            // repository using examples/keycloak-integration/run-keycloak.sh
            method: 'oidc',
            provider: 'http://127.0.0.1:18080/realms/hawtio-demo',
            client_id: 'hawtio-client',
            response_mode: 'fragment',
            scope: 'openid email profile',
            redirect_uri: `http://localhost:${port}/hawtio/`,
            code_challenge_method: 'S256',
            prompt: null,
            // Hawtio (oidc plugin) will fetch this configuration from .well-known/openid-configuration
            // with Hawtio Java it may already be part of this response
            'openid-configuration': null,
          }
          devServer.app.get(`${publicPath}/auth/config/oidc`, (_, res) => {
            res.type('application/json')
            if (oidcEnabled) {
              res.send(JSON.stringify(keycloakOidcConfig))
            } else {
              res.send('{}')
            }
          })

          /* Available authentication methods to configure <HawtioLogin> page */

          const authLoginConfig = [
            {
              method: 'basic',
              name: 'Basic Authentication',
              realm: 'Hawtio Realm',
            },
            {
              // special method that is declared at server side, but never handled in @hawtio/react
              method: 'external',
              name: 'Spring Security',
            },
            {
              // Actual configuration of OIDC provider will be added from
              // /auth/config/oidc endpoint
              // TODO: support more OIDC methods - like Keycloak, Azure and Spring Authorization Server at the same time
              method: 'oidc',
              name: 'OpenID Connect (Keycloak)',
            },
            {
              // Actual configuration of Keycloak provider will be added from
              // /keycloak/client-config endpoint
              method: 'keycloak',
              name: 'Keycloak (keycloak.js)',
            },
            // {
            //   "method": "form",
            //   "name": "Form/Session Authentication (application/x-www-form-urlencoded)",
            //   "url": `${publicPath}/auth/login`,
            //   "logoutUrl": `${publicPath}/auth/logout`,
            //   "type": "form",
            //   "userField": "username",
            //   "passwordField": "password"
            // },
            {
              method: 'form',
              name: 'Form/Session Authentication (application/json)',
              url: `${publicPath}/auth/login`,
              logoutUrl: `${publicPath}/auth/logout`,
              type: 'json',
              userField: 'username',
              passwordField: 'password',
            },
          ]
          devServer.app.get(`${publicPath}/auth/config/login`, (_, res) => {
            // res.json([])
            res.json(authLoginConfig)
          })

          // Hawtio backend middleware should be run before other middlewares (thus 'unshift')
          // in order to handle GET requests to the proxied Jolokia endpoint.
          middlewares.unshift({
            name: 'hawtio-backend',
            path: `${publicPath}/proxy`,
            middleware: hawtioBackend({
              // Uncomment it if you want to see debug log for Hawtio backend
              logLevel: 'debug',
            }),
          })

          return middlewares
        },
      },
    }
  ]
}
