const { ModuleFederationPlugin } = require('webpack').container
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { dependencies } = require('./package.json')
const path = require('path')

const outputPath = path.resolve(__dirname, 'build')

module.exports = (_, args) => {
  const isProduction = args.mode === 'production'
  return {
    entry: './src/index',
    plugins: [
      new ModuleFederationPlugin({
        name: 'samplePlugin',
        filename: 'remoteEntry.js',
        exposes: {
          './plugin': './src/sample-plugin',
        },
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
            noErrorOnMissing: true,
          },
        ],
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
  }
}
