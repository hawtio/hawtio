
module.exports = function(grunt) {

  grunt.log.writeln("Building hawt.io");

  var sourceDir = '../hawtio-web/src/main/webapp/app';
  var target = 'target';
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

    // https://www.npmjs.org/package/grunt-bower
    bower: {
      install: {
        options: {
          targetDir: 'src/main/webapp/bower_components',
          copy: false
        }
      }
    },

    // https://www.npmjs.org/package/grunt-wiredep
    wiredep: {
      target: {
        src: [
          'src/main/webapp/index.html',
          'src/test/config/karma.conf.js'
        ],
        fileTypes: {
          js: {
            block: /(([\s\t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
            detect: {
              js: /'(.*\.js)'/gi
            },
            replace: {
              js: 'libdir + \'../{{filePath}}\','
            }
          }
        },
        options: {
          ignorePath: '../../../',
          dependencies: true,
          overrides: {
            'js-logger': {
              "main": "src/logger.js"
            },
            'jolokia': {
              "main": "jolokia.js"
            },
            'bootstrap': {
              "main": ['docs/assets/css/bootstrap.css', 'docs/assets/js/bootstrap.js']
            },
            'Font-Awesome': {
              "main": ['css/font-awesome.css']
            },
            'elastic.js': {
              "main": ['dist/elastic.min.js']
            },
            'd3': {
              "main": ['./d3.min.js']
            }
          }
        }
      }
    },

    // https://www.npmjs.org/package/grunt-typescript (~8 seconds)
    typescript: {
      base: {
        src: typescriptFiles,
        dest: target + "/app.js",
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
        dest: target + "/app.js",
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
        src: 'src/main/webapp/app/app.d.ts',
        dest: 'target/hawtio.d.ts'
      }
    },

    // https://www.npmjs.org/package/grunt-ng-annotate
    ngAnnotate: {
      app: {
        files: {
          'app.js': [target + '/app.js']
        }
      }
    },

    // https://github.com/gruntjs/grunt-contrib-uglify
    uglify: {
      generated: {

      }
    },

    // https://github.com/gruntjs/grunt-contrib-watch
    watch: {
      tsc: {
        files: [ "src/main/webapp/app/**/*.ts" ],
        tasks: [ "filterts", "typescript:base", 'rename', "ngAnnotate:app" ]
      }
    },

    // https://www.npmjs.org/package/grunt-usemin
    useminPrepare: {
      html: 'src/main/webapp/index.html',
      options: {
        dest: 'dist'
      }
    },

    // https://www.npmjs.org/package/grunt-usemin
    usemin: {
      html: 'dist/**/*.html'
    },

    // https://www.npmjs.org/package/grunt-copy
    copy: {
      html: {
        cwd: 'src/main/webapp',
        files: [
          { expand: true, cwd: 'src/main/webapp/', src: ['**/*', '!**/*.ts', '!**/*.map'], dest: 'dist/' }
        ]
      }
    },

    // https://github.com/hollandben/grunt-cache-bust
    cacheBust: {
      options: {
        rename: false
      },
      assets: {
        files: [{
          src: ['dist/index.html']
        }]
      }
    },

    // https://www.npmjs.org/package/grunt-express
    // https://github.com/blai/grunt-express
    express: {
      server: {
        options: {
          port: 9001,
          bases: [ 'src/main/webapp', 'dist' ]
        }
      }
    },

  });

  require('load-grunt-tasks')(grunt);

  /* task aliases */

  // "grunt server" starts a webserver which hosts hawt.io without backend Java server
  // this might be however very useful to connect to existing Jolokia agent
  grunt.registerTask("server", "Starts a webserver which hosts hawt.io without backend Java server", [ "express:server", "express-keepalive" ]);

  // TS compiler with fast incremental watcher
  grunt.registerTask("tsc", [ "filterts", "typescript:dev" ]);

  // distribution tasks

  grunt.registerTask("default", [
    "filterts",
    "typescript:base",
  ]);

};
