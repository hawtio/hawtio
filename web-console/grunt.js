module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-type');
  /*
   grunt.loadNpmTasks('grunt-typescript');
   */

  // Project configuration.

  var appFiles = ['src/main/d.ts/*.ts', 'src/main/webapp/ts/*.ts'];
  grunt.initConfig({
    test:{
      files:['src/test/js/**/*.js']
    },
    /*
     typescript: {
     base: {
     src: ['src/main/d.ts*/
    /*.ts',
     'src/main/webapp/ts*/
    /*.ts'],
     dest: 'src/main/webapp/app.js',
     options: {
     module: 'amd',
     target: 'ES5'
     }
     }
     },
     */
    type:{
      compile:{
        files:{
          'src/main/webapp/js/app.js':appFiles
        },
        options:{
          target:'ES5'
        }
      },
      options:{
        module:'amd',
        style:'eqeqeq;bitwise'
      }
    },
    watch: {
      app: {
        files: appFiles,
        tasks: 'type'
      }
    }
  });


  // Default task.
  grunt.registerTask('default', 'type watch');

};