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
      libdir + 'angular.js',
      libdir + 'angular-bootstrap.min.js',
      libdir + 'angular-resource.min.js',
      // bower:js
      libdir + '../../../main/webapp/bower_components/jquery/jquery.js',
      libdir + '../../../main/webapp/bower_components/js-logger/src/logger.js',
      libdir + '../../../main/webapp/bower_components/bootstrap/docs/assets/js/bootstrap.js',
      libdir + '../../../main/webapp/bower_components/d3/d3.min.js',
      libdir + '../../../main/webapp/bower_components/elastic.js/dist/elastic.min.js',
      libdir + '../../../main/webapp/bower_components/underscore/underscore.js',
      libdir + '../../../main/webapp/bower_components/keycloak/dist/keycloak.js',
      // endbower
      libdir + 'loggingInit.js',
      libdir + 'cubism.v1.min.js',
      libdir + 'jolokia-cubism-min.js',
      libdir + 'jolokia-simple-min.js',
      libdir + 'ng-grid.min.js',
      libdir + 'jquery.cookie.js',
      // has some jquery-ui dependency so throws a spurious error
      //libdir + 'jquery.dynatree.min.js',
      libdir + 'jquery.gridster.min.js',
      libdir + 'jquery.dataTables.min.js',
      libdir + 'ColReorder.min.js',
      libdir + 'KeyTable.js',
      libdir + 'jquery.xml2json.js',
      libdir + 'jquery.backstretch.min.js',
      libdir + 'toastr.js',
      libdir + 'dagre.min.js',
      libdir + 'jquery.jsPlumb-1.6.4-min.js',
      libdir + 'dangle.min.js',
      libdir + 'codemirror/codemirror.js',
      libdir + 'codemirror/addon/edit/closetag.js',
      libdir + 'codemirror/addon/edit/continuecomment.js',
      libdir + 'codemirror/addon/edit/continuelist.js',
      libdir + 'codemirror/addon/edit/matchbrackets.js',
      libdir + 'codemirror/addon/fold/foldcode.js',
      libdir + 'codemirror/addon/format/formatting.js',
      libdir + 'codemirror/mode/javascript/javascript.js',
      libdir + 'codemirror/mode/xml/xml.js',
      libdir + 'codemirror/mode/css/css.js',
      libdir + 'codemirror/mode/htmlmixed/htmlmixed.js',
      libdir + 'codemirror/mode/markdown/markdown.js',
      libdir + 'codemirror/mode/diff/diff.js',
      libdir + 'codemirror/mode/properties/properties.js',
      libdir + 'codemirror/mode/clike/clike.js',
      libdir + 'codemirror/mode/yaml/yaml.js',
      libdir + 'angular-ui.js',
      libdir + 'ui-bootstrap-0.4.0.min.js',
      libdir + 'ui-bootstrap-tpls-0.4.0.min.js',
      libdir + 'sugar-1.4.1-custom.min.js',
      libdir + 'camelModel.js',
      libdir + 'jsonschema.js',
      libdir + 'dozerMapping.js',
      libdir + 'dozerField.js',
      libdir + 'dozerMappings.js',
      libdir + 'dozerFieldExclude.js',
      libdir + 'marked.js',
      libdir + 'dmr.js.nocache.js',
      libdir + 'ZeroClipboard.min.js',
      libdir + 'angular-file-upload.min.js',
      libdir + 'metrics-watcher.js',
      libdir + 'hawtio-plugin-loader.js',
      'src/test/specs/lib/angular-mocks.js',
      'src/main/webapp/app/app.js',
      'src/test/specs/spec-js/**/*.js',
      'src/test/fixtures/*.html'
    ],


    // list of files to exclude
    exclude: [

    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.html': ['html2js']
      //'**/*.ts': ['typescript'] // too slow
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // enable / disable colors in the output (reporters and logs)
    colors: false,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_WARN,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true

//    typescriptPreprocessor: {
//      options: {
//        target: 'ES5'
//      },
//      transformPath: function(path) {
//        return path.replace(/\.ts$/, '.js');
//      }
//    }

  });
};
