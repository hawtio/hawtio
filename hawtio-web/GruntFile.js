module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
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
        files: [
          {
            src: appFiles,
            dest: "<%= grunt.option('webapp_outdir') %>/app/app.js"
          }
        ],
        options:{
          sourcemap: true,
          target: 'es5',
          //module:'amd',
          style:'eqeqeq;bitwise'
        }
      }
    },
    copy:{
      dist: {
        files: [
          {
            expand: true,
            cwd: "src/main/webapp/",
            src: ["./**"],
            dest: "<%= grunt.option('webapp_outdir') %>/"
          }
        ]
      },
      test: {
        files: [
          {
            expand: true,
            cwd: "<%= grunt.option('webapp_outdir') %>/",
            src: ["./**"],
            dest: "src/test/unit/"
          }]
      }
    },
    concat: {
      main: {
        src: ["target/schema/js/*.js", "src/main/webapp/app/**/*.js", "<%= grunt.option('webapp_outdir') %>/app/app.js"],
        dest: "<%= grunt.option('webapp_outdir') %>/app/app.js"
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
        files: ["src/main/webapp/**", "target/schema/js/*.js"],
        tasks: ['type', 'concat', 'copy', 'reload']
      }
    }
  });


  // Default task.
  grunt.registerTask('default', ['type', 'concat', 'copy']);

  // watch source for changes
  grunt.registerTask('watchSrc', ['type', 'concat', 'copy', 'reload', 'watch']);

};
