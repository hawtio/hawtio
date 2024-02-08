const { ModuleFederationPlugin } = require('webpack').container
const CracoEsbuildPlugin = require('craco-esbuild')
const { dependencies } = require('./package.json')

module.exports = {
  plugins: [{ plugin: CracoEsbuildPlugin }],
  webpack: {
    plugins: {
      add: [
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
          },
        }),
      ],
    },
    configure: webpackConfig => {
      // Required for Module Federation
      webpackConfig.output.publicPath = 'auto'

      webpackConfig.module.rules.push({
        test: /\.md/,
        type: 'asset/source',
      })

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

      // MiniCssExtractPlugin - Ignore order as otherwise conflicting order warning is raised
      const miniCssExtractPlugin = webpackConfig.plugins.find(p => p.constructor.name === 'MiniCssExtractPlugin')
      if (miniCssExtractPlugin) {
        miniCssExtractPlugin.options.ignoreOrder = true
      }

      return webpackConfig
    },
  },
}
