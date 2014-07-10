
module.exports = function(grunt) {

  grunt.log.writeln("Building hawt.io");

  grunt.config.init({
    pkg: grunt.file.readJSON("package.json"),

    /* task configuration */

    // grunt-contrib-connect
    connect: {
      devserver: {
        options: {
          port: 8010,
          base: 'src/main/webapp',
//          middleware: function(connect, options) {
//          },
          keepalive: true
        }
      }
    },

    // grunt-karma
    karma: {
      unit: {
        configFile: "src/test/config/karma.conf.js",
        // override karmaConfig.js settings here:
        singleRun: true,
        autoWatch: false
      },
      chrome: {
        configFile: "src/test/config/karma.conf.js",
        browsers: ['Chrome']
      }
    }
  });

  /* load & register tasks */

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-karma');

  /* task aliases */

  // "grunt webserver" starts a webserver which hosts hawt.io without backend Java server
  // this might be however very useful to connect to existing Jolokia agent
  grunt.registerTask("webserver", "Starts a webserver which hosts hawt.io without backend Java server", [ "connect:devserver" ]);

  grunt.registerTask("test", "Runs unit tests once", [ "karma:unit" ]);
  grunt.registerTask("test-chrome", "Runs unit tests continuously with autowatching", [ "karma:chrome" ]);

};
