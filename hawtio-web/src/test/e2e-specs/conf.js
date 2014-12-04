exports.config = {
  specs: ['**/*_spec.js'],

  baseUrl: 'http://localhost:8282/hawtio',

  onPrepare: function() {
    // The require statement must be down here, since jasmine-reporters@1.0
    // needs jasmine to be in the global and protractor does not guarantee
    // this until inside the onPrepare function.
    require('jasmine-reporters');
    jasmine.getEnv().addReporter(
      new jasmine.JUnitXmlReporter('target/failsafe-reports', true, true)
    );
  }
}
