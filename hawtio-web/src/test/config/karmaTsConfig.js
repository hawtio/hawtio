// Karma configuration
// Generated on Wed Jul 09 2014 10:49:52 GMT+0200 (CEST)

module.exports = function(config) {
  var basedir = 'src/main/webapp/';
  var libdir = basedir + 'lib/';
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../../..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'src/main/webapp/lib/angular.min.js',
      'src/main/webapp/lib/jquery-1.8.2.min.js',
      'src/test/specs/lib/utils/testHelpers.ts',
      'src/test/specs/lib/angular-mocks.js',
      'src/main/webapp/app/baseHelpers.ts',
      'src/test/specs/spec-ts/*.ts'
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.html': ['html2js'],
      '**/*.ts': ['typescript']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    typescriptPreprocessor: {
      options: {
        target: 'ES5'
      },
      transformPath: function(path) {
        return path.replace(/\.ts$/, '.js');
      }
    }

  });
};
