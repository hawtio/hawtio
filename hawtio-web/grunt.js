module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-type');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-reload');

  /*
   grunt.loadNpmTasks('grunt-typescript');
   */

  // Project configuration.

  var appFiles = ['src/main/d.ts/*.ts', 'src/main/webapp/js/**/*.ts'];
  var resourceFiles = [
      'src/main/webapp/img/**',
      'src/main/webapp/css/**',
      'src/main/webapp/partials/**',
      'src/main/webapp/lib/**',
      'src/main/webapp/font/**'
  ];
  grunt.initConfig({
    test:{
      files:['src/test/js/**/*.js']
    },
    type:{
      compile:{
        files:{
          'target/hawtio-web-1.0-SNAPSHOT/js/app.js':appFiles
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
                "target/hawtio-web-1.0-SNAPSHOT/": "src/main/webapp/**"
            }
        }
    },
    reload: {
      port: 35729,
      liveReload: {},
      proxy: {
        host: 'localhost',
        port: 8181
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
