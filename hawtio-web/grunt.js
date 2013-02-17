module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-type');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-reload');

  /*
   grunt.loadNpmTasks('grunt-typescript');
   */

  // Project configuration.
  var port = grunt.option('webapp_port');
  if (!port) {
    port = 8181;
  }
  var appFiles = ['src/main/d.ts/**/*.ts', 'src/main/webapp/app/**/*.ts'];
  grunt.initConfig({
    test:{
      files:['src/test/js/**/*.js']
    },
    type:{
      compile:{
        files:{
          "<%= grunt.option('webapp_outdir') %>/app/app.js":appFiles,
          // Also compile the code and put it into the unit test folder so it can perform tests
          // Should it be placed somewhere else perhaps?
          "src/test/unit/app.js":appFiles
        },
        options:{
          target:'ES5'
        }
      },
      options:{
        sourcemap: true,
        module:'amd',
        style:'eqeqeq;bitwise'
      }
    },
    copy:{
        dist: {
            files: {
              "<%= grunt.option('webapp_outdir') %>/": "src/main/webapp/**"
            }
        }
    },
    reload: {
      port: 35729,
      liveReload: {},
      proxy: {
        host: 'localhost',
        port: port
      }
    },
    watch: {
      app: {
        files: "src/main/webapp/**",
        tasks: 'copy type reload'
      }
    }
  });


  // Default task.
  grunt.registerTask('default', 'copy type reload watch');

};
