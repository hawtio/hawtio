
module.exports = function(grunt) {

  grunt.log.writeln("Building hawt.io");

  var sourceDir = '../hawtio-web/src/main/webapp/app';
  var target = 'src/main/webapp/app';
  var appjs = target + '/app.js';
  var ngAnnotateFiles = {};
  ngAnnotateFiles[appjs] = [appjs];
  var typescriptFiles = [];

  grunt.registerTask('filterts', 'Find plugins to compile', function() {
    typescriptFiles.length = 0;
    var plugins = (grunt.option("plugins") || "core,kubernetes,ui").split(',');
    grunt.log.writeln("Desired plugins: ", plugins);
    grunt.file.recurse(sourceDir, function (abspath, rootDir, subDir, fileName) {
      if (subDir && fileName.endsWith('.ts')) {
        var plugin = subDir.split('/')[0];
        plugins.forEach(function(p) {
          if (p === plugin) {
            grunt.log.writeln("Including: ", abspath);
            typescriptFiles.push(abspath);
          }
        });
      }
    });
  });

  grunt.config.init({

    pkg: grunt.file.readJSON("package.json"),

    /* task configuration */
    // https://www.npmjs.org/package/grunt-typescript (~8 seconds)
    typescript: {
      base: {
        src: typescriptFiles,
        dest: appjs,
        options: {
          removeComments: true,
          module: "commonjs",
          target: "ES5",
          declaration: true,
          sourceMap: true,
          watch: false
        }
      },
      dev: {
        src: [ typescriptFiles ],
        dest: appjs,
        options: {
          removeComments: true,
          module: "commonjs",
          target: "ES5",
          declaration: false,
          sourceMap: true,
          watch: grunt.option("watch") ? {
            path: sourceDir,
            atBegin: true
          } : false
        }
      }
    },

    // https://www.npmjs.org/package/grunt-rename
    rename: {
      declaration: {
        src: target + '/app.d.ts',
        dest: target + '/hawtio.d.ts'
      }
    },

    // https://www.npmjs.org/package/grunt-ng-annotate
    ngAnnotate: {
      app: {
        files: ngAnnotateFiles
      }
    },

  });

  require('load-grunt-tasks')(grunt);

  /* task aliases */
  // TS compiler with fast incremental watcher
  grunt.registerTask("tsc", [ "filterts", "typescript:dev", "ngAnnotate", "rename" ]);

  // distribution tasks

  grunt.registerTask("default", [
    "filterts",
    "typescript:base",
    "ngAnnotate:app",
    "rename"
  ]);

};
