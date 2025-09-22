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

module.exports = (_, args) => {
  const isProduction = args.mode === 'production'
  return {
    entry: './src/index',
    plugins: [
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
            requiredVersion: '~1.9.6-redhat',
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
        languages: ['xml', 'json', 'html', 'plaintext'],
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
      port: 3000,
      static: path.join(__dirname, 'public'),
      historyApiFallback: {
        // Needed to fallback to bundled index instead of public/index.html template
        index: publicPath,
      },
      devMiddleware: { publicPath },
      setupMiddlewares: (middlewares, devServer) => {
        devServer.app.use(bodyParser.json())

        // Redirect / or /hawtio to /hawtio/
        if (publicPath && publicPath !== '/') {
          devServer.app.get('/', (_, res) => res.redirect(`${publicPath}/`))
          devServer.app.get(`${publicPath}$`, (_, res) => res.redirect(`${publicPath}/`))
        }

        const username = 'developer'
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
        let login = true
        devServer.app.get(`${publicPath}/user`, (_, res) => {
          login ? res.send(`"${username}"`) : res.sendStatus(403)
        })
        devServer.app.post(`${publicPath}/auth/login`, (req, res) => {
          // Test authentication throttling with username 'throttled'
          const { username } = req.body
          if (username === 'throttled') {
            res.append('Retry-After', 10) // 10 secs
            res.sendStatus(429)
            return
          }

          login = true
          res.send(String(login))
        })
        devServer.app.get(`${publicPath}/auth/logout`, (_, res) => {
          login = false
          res.redirect(`${publicPath}/login`)
        })

        const oidcEnabled = false
        const oidcConfig = {
          method: 'oidc',
          provider: 'https://login.microsoftonline.com/11111111-2222-3333-4444-555555555555/v2.0',
          client_id: '66666666-7777-8888-9999-000000000000',
          response_mode: 'fragment',
          scope: 'openid email profile api://hawtio-server/Jolokia.Access',
          redirect_uri: 'http://localhost:3000/hawtio/',
          code_challenge_method: 'S256',
          prompt: 'login',
        }
        devServer.app.get(`${publicPath}/auth/config`, (_, res) => {
          res.type('application/json')
          if (oidcEnabled) {
            res.send(JSON.stringify(oidcConfig))
          } else {
            res.send('{}')
          }
        })
        devServer.app.get(`${publicPath}/auth/config/session-timeout`, (_, res) => {
          res.type('application/json')
          res.send('{}')
        })
        devServer.app.get(`${publicPath}/proxy/enabled`, (_, res) => res.send(String(proxyEnabled)))
        devServer.app.get(`${publicPath}/plugin`, (_, res) => res.send(JSON.stringify(plugin)))
        devServer.app.get(`${publicPath}/keycloak/enabled`, (_, res) => res.send(String(keycloakEnabled)))
        devServer.app.get(`${publicPath}/keycloak/client-config`, (_, res) =>
          res.send(JSON.stringify(keycloakClientConfig)),
        )
        devServer.app.get(`${publicPath}/keycloak/validate-subject-matches`, (_, res) => res.send('true'))

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
}
