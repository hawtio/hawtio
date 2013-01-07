basePath = '../../../';

files = [
  ANGULAR_SCENARIO,
  ANGULAR_SCENARIO_ADAPTER,
  'src/test/e2e/**/*.js'
];

autoWatch = false;
singleRun = true;

logLevel = LOG_INFO;

browsers = ['Chrome'];

proxies = {
  '/': 'http://localhost:8080/'
};

reporters = ['dots', 'progress', 'junit'];

junitReporter = {
  outputFile: 'target/test-out-e2e.xml',
  suite: 'e2e'
};
