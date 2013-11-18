module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-type');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Project configuration.
  var webapp_outdir = grunt.option('webapp_outdir');

  if (!webapp_outdir) {
    webapp_outdir = 'target/hawtio-web-1.2-SNAPSHOT'
    grunt.option('webapp_outdir', webapp_outdir);
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
      docs: {
        files: [
          {
            expand: true,
            cwd: "..",
            src: ["./*.md"],
            dest: "<%= grunt.option('webapp_outdir') %>/app/core/doc/"
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
        files: ['src/main/webapp/**',
                '!src/main/webapp/**/*.ts',
                'GruntFile.js',
                "<%= grunt.option('webapp_outdir') %>/lib/*.js",
                "<%= grunt.option('webapp_outdir') %>/app/app.js"],
        tasks: [],
        options: {
          livereload: true,
          spawn: false
        }
      }
    }
  });

  //grunt.config.set('currentTasks', fullBuild);

  // Default task.
  grunt.registerTask('default', ['clean-appjs', 'type', 'concat', 'copy']);

  // watch source for changes
  grunt.registerTask('watchSrc', ['watch']);

};
