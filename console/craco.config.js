const { hawtioBackend } = require('@hawtio/backend-middleware')

module.exports = {
  webpack: {
    configure: {
      ignoreWarnings: [
        // For suppressing sourcemap warnings coming from superstruct
        function ignoreSourcemapsloaderWarnings(warning) {
          return warning.module
            && warning.module.resource.includes('node_modules')
            && warning.details
            && warning.details.includes('source-map-loader')
        },
      ],
    },
  },
  devServer: {
    setupMiddlewares: (middlewares) => {
      middlewares.push({
        name: 'hawtio-backend',
        path: '/proxy',
        middleware: hawtioBackend({
          // Uncomment it if you want to see debug log for Hawtio backend
          logLevel: 'debug',
        })
      })

      return middlewares
    }
  }
}
