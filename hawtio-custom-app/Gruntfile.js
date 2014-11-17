
module.exports = function(grunt) {

  grunt.log.writeln("Building hawt.io");

  var sourceDir = '../hawtio-web/src/main/webapp/';
  var sourceAppDir = sourceDir + 'app';
  var webappDir = 'src/main/webapp/';
  var target = webappDir + 'app/';
  var indexHtml = webappDir + 'index.html';
  var appjs = target + 'app.js';
  var appjsMap = target + 'app.js.map';
  var ngAnnotateFiles = {};
  ngAnnotateFiles[appjs] = [appjs];
  var typescriptFiles = [];

  grunt.registerTask('filterts', 'Find plugins to compile', function() {
    typescriptFiles.length = 0;
    var plugins = (grunt.option("plugins") || "core,kubernetes,ui").split(',');
    grunt.log.writeln("Desired plugins: ", plugins);
    grunt.file.recurse(sourceAppDir, function (abspath, rootDir, subDir, fileName) {
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
      }
    },

    // https://www.npmjs.org/package/grunt-rename
    rename: {
      declaration: {
        src: target + 'app.d.ts',
        dest: target + 'hawtio.d.ts'
      }
    },

    copy: {
      main: {
        files: [
          { expand: true, cwd: sourceDir, src: 'index.html', dest: webappDir },
          { expand: true, cwd: sourceDir, src: '**/*.js', dest: webappDir },
          { expand: true, cwd: sourceDir, src: '**/*.css', dest: webappDir }
        ]
      },
      watch: {
        files: [
          { src: [appjs], dest: sourceAppDir + 'app.js' },
          { src: [appjsMap], dest: sourceAppDir + 'app.map.js' }
        ]
      }
    },

    watch: {
      tsc: {
        files: [ sourceDir + "/**/*.ts" ],
        tasks: [ "filterts", "typescript:base", "ngAnnotate:app", "rename", "copy:watch" ]
      }
    },

    // https://www.npmjs.org/package/grunt-usemin
    useminPrepare: {
      html: indexHtml,
      options: {
        dest: webappDir
      }
    },

    // https://www.npmjs.org/package/grunt-usemin
    usemin: {
      html: webappDir + 'index.html'
    },


    // https://www.npmjs.org/package/grunt-ng-annotate
    ngAnnotate: {
      app: {
        files: ngAnnotateFiles
      }
    },

  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask("default", [
    "filterts",
    "typescript:base",
    "ngAnnotate:app",
    "rename"
  ]);

  grunt.registerTask("dist", [
    "copy:main",
    "default",
    "useminPrepare",
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'usemin'
  ]);

  /* task aliases */
  grunt.registerTask("tsc", [ "default", "copy:watch", "watch:tsc" ]);


};
