module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-type');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');

  /*
   grunt.loadNpmTasks('grunt-typescript');
   */

  // Project configuration.
  var port = grunt.option('webapp_port');
  var webapp_outdir = grunt.option('webapp_outdir');

  if (!port) {
    port = 8181;
  }

  grunt.task.registerTask('clean-appjs', 'Clean up generated app.js file', function() {
    var file = webapp_outdir + "/app/app.js";
    grunt.log.writeln("Cleaning up " + file);
    grunt.file.delete(file, { force: true });
  });

  var appFiles = ['src/main/d.ts/*.ts', 'src/main/webapp/app/**/*.ts'];

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
          sourcemap: false,
          target: 'es5',
          //module:'amd',
          style:'eqeqeq;bitwise'
        }
      }
    },
    less: {
      options: {
        paths: ['src/main/webapp/css']
      },
      src: {
        expand: true,
        cwd: 'src/main/webapp/css',
        src: '*.less',
        ext: '.css',
        dest: "<%= grunt.option('webapp_outdir') %>/css"
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
        src: ["target/schema/js/*.js", "<%= grunt.option('webapp_outdir') %>/app/app.js"],
        dest: "<%= grunt.option('webapp_outdir') %>/app/app.js"
      }
    },
    watch: {
      app: {
        files: ["src/main/webapp/**", "target/schema/js/*.js"],
        tasks: ['clean-appjs', 'type', 'concat', 'copy:dist'],
        options: {
          livereload: true
        }
      }
    }
  });


  // Default task.
  grunt.registerTask('default', ['clean-appjs', 'type', 'concat', 'copy', 'less']);

  // watch source for changes
  grunt.registerTask('watchSrc', ['clean-appjs', 'type', 'concat', 'copy', 'less', 'watch']);

};
