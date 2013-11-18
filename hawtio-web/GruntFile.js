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
  }

  /*
  no idea why this wouldn't work :-/
  var fullBuild = ['clean-appjs', 'type', 'concat', 'copy:dist'];
  var partialBuild = ['copy:dist'];

  function endsWith(str, suffix) {
    if (!str || !suffix || suffix.length > str.length) {
      return false;
    }
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  var changedFiles = Object.create(null);

  var onChange = grunt.util._.debounce(function() {
    grunt.config.set('currentTasks', partialBuild);
    grunt.log.writeln('tasks before checking files: ', currentTasks);
    Object.keys(changedFiles).forEach(function(filename) {
      grunt.log.writeln('Checking file: ', filename);
      if (endsWith(filename, '.ts') ||
         (endsWith(filename, '.js') && !endsWith(filename, 'GruntFile.js'))) {
        grunt.log.writeln('need a full build for ', filename);
        grunt.config.set('currentTasks', fullBuild);
      }
    });
    grunt.log.writeln('tasks after checking files: ', currentTasks);
    changedFiles = Object.create(null);
  }, 200);

  grunt.event.on('watch', function(action, filename) {
    changedFiles[filename] = action;
    onChange();
  });

  grunt.task.registerTask('conditionalBuild', 'Maybe build everything, maybe not', function() {
    var done = this.async();
    grunt.log.writeln('Checking build type...');
    setTimeout(function() {
      var tasks = grunt.config.get('currentTasks');
      grunt.log.writeln("Running tasks: ", tasks);
      grunt.task.run(tasks);
      done();
    }, 1000);
  });
  */

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
        files: ["src/main/webapp/**", "target/schema/js/*.js"],
        tasks: ['clean-appjs', 'type', 'concat', 'copy:dist'],
        options: {
          livereload: true,
          spawn: false
        }
      }
    }
  });

   //files: ['src/main/webapp/**', '!src/main/webapp/**/*.ts', 'target/schema/js/*.js', 'GruntFile.js', "<%= grunt.option('webapp_outdir') %>/app/app.js"],
   //tasks: ['copy'],

  //grunt.config.set('currentTasks', fullBuild);

  // Default task.
  grunt.registerTask('default', ['clean-appjs', 'type', 'concat', 'copy']);

  // watch source for changes
  grunt.registerTask('watchSrc', ['watch']);

};
