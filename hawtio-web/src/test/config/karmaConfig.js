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
      libdir + 'rainbow.js',
      libdir + 'language/javascript.js',
      libdir + 'language/generic.js',
      libdir + 'logger.min.js',
      libdir + 'loggingInit.js',
      libdir + 'hawtio-plugin-loader.js',
      libdir + 'd3.v3.min.js',
      libdir + 'jquery-1.8.2.min.js',
      libdir + 'jolokia-min.js',
      libdir + 'cubism.v1.min.js',
      libdir + 'jolokia-cubism-min.js',
      libdir + 'jolokia-simple-min.js',
      libdir + 'bootstrap.min.js',
      libdir + 'angular.js',
      libdir + 'angular-bootstrap.min.js',
      libdir + 'angular-resource.min.js',
      libdir + 'ng-grid.min.js',
      libdir + 'jquery.cookie.js',
      //libdir + 'jquery.dynatree.min.js',
      libdir + 'jquery.gridster.min.js',
      libdir + 'jquery.dataTables.min.js',
      libdir + 'ColReorder.min.js',
      libdir + 'KeyTable.js',
      libdir + 'jquery.xml2json.js',
      libdir + 'jquery.backstretch.min.js',
      libdir + 'toastr.js',
      libdir + 'dagre.min.js',
      libdir + 'jquery.jsPlumb-1.4.1-all-min.js',
      libdir + 'elastic-angular-client.min.js',
      libdir + 'elastic.min.js',
      libdir + 'd3.min.js',
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
      libdir + 'sugar-1.3.6-custom.min.js',
      libdir + 'camelModel.js',
      libdir + 'jsonschema.js',
      libdir + 'dozerMapping.js',
      libdir + 'dozerField.js',
      libdir + 'dozerMappings.js',
      libdir + 'dozerFieldExclude.js',
      libdir + 'marked.js',
      libdir + 'angular-dragdrop.min.js',
      libdir + 'dmr.js.nocache.js',
      libdir + 'ZeroClipboard.min.js',
      libdir + 'src/main/webapp/lib/hawtio-plugin-loader.js',
      'src/main/webapp/app/app.js',
      'src/test/specs/spec/*.js',
      'src/test/specs/*.html'
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.html': ['html2js']
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
    singleRun: false
  });
};
