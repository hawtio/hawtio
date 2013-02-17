basePath = '../../../';

// Files to load during unit test running
files = [
    // Used for unit tests
    JASMINE,
    JASMINE_ADAPTER,

    // AngularJs Dependencies
    "src/main/webapp/lib/angular.js",
    "src/main/webapp/lib/angular-*.js",
    "src/main/lib.disabled/angular-mocks.js",

    // Load up the libraries which hawtio directly makes use of when bootstrapping
    "src/main/webapp/lib/jquery-1.8.2.js",
    "src/main/webapp/lib/bootstrap.js",
    "src/main/webapp/lib/jolokia*.js",
    "src/main/webapp/lib/ng-grid-1.6.3.debug.js",

    // Hawtio App Code
    "src/main/webapp/app/core/js/hawtio-plugin-loader.js",
    // I needed to put the compiled app.js code here to make the unit tests work...
    "src/test/unit/app.js",

    // Point to the actual Unit Tests
    "src/test/unit/**/*.js"
];

autoWatch = false;
singleRun = true;

logLevel = LOG_INFO;

browsers = ['Chrome'];

reporters = ['dots', 'progress', 'junit'];

junitReporter = {
    outputFile: 'target/test-out-unit.xml',
    suite: 'unit'
};
