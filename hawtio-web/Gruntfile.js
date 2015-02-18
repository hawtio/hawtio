
module.exports = function(grunt) {

  grunt.log.writeln("Building hawt.io");

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

    // https://www.npmjs.org/package/grunt-karma
    karma: {
      unit: {
        configFile: "src/test/config/karma.conf.js"
      },
      chrome: {
        configFile: "src/test/config/karma.conf.js",
        autoWatch: true,
        singleRun: false,
        browsers: [ "Chrome" ]
      }
    },

    // https://www.npmjs.org/package/grunt-typescript (~8 seconds)
    typescript: {
      base: {
        src: [ "src/main/d.ts/*.d.ts", "src/main/webapp/app/**/*.ts" ],
        dest: "src/main/webapp/app/app.js",
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
        src: [ "src/main/d.ts/*.d.ts", "src/main/webapp/app/*/**/*.ts", "src/main/webapp/app/baseHelpers.ts", "src/main/webapp/app/baseIncludes.ts" ],
        dest: "src/main/webapp/app/app.js",
        options: {
          removeComments: true,
          module: "commonjs",
          target: "ES5",
          declaration: false,
          sourceMap: true,
          watch: grunt.option("watch") ? {
            path: "src/main/webapp/app",
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
          'src/main/webapp/app/app.js': ['src/main/webapp/app/app.js']
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
        tasks: [ "typescript:base", 'rename', "karma:unit", "ngAnnotate:app" ]
      },
      tests: {
        files: [ "src/test/specs/**/*.js" ],
        tasks: [ "karma:unit" ]
      }
    },

    // https://www.npmjs.org/package/grunt-angular-modules-graph
    'modules-graph': {
      options: {
        // Task-specific options go here.
      },
      generate: {
        files: {
          'target/graph.dot': [ 'src/main/webapp/app/app.js' ]
        }
      }
    },

    // https://www.npmjs.org/package/grunt-graphviz
    graphviz: {
      graph: {
        files: {
          'target/dependencies-graph.png': 'target/graph.dot'
        }
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

    // https://github.com/teerapap/grunt-protractor-runner
    protractor: {
      options: {
        configFile: "node_modules/protractor/docs/referenceConf.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: grunt.option("color") ? false : true, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      all: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
        options: {
          configFile: grunt.option("headless") ? "src/test/e2e-specs/phantomjs_conf.js" : "src/test/e2e-specs/conf.js"
        }
      }
    }

  });

  require('load-grunt-tasks')(grunt);

  /* task aliases */

  // "grunt server" starts a webserver which hosts hawt.io without backend Java server
  // this might be however very useful to connect to existing Jolokia agent
  grunt.registerTask("server", "Starts a webserver which hosts hawt.io without backend Java server", [ "express:server", "express-keepalive" ]);

  // test related tasks

  grunt.registerTask("test", "Runs unit tests once", [ "karma:unit" ]);
  grunt.registerTask("test-chrome", "Runs unit tests continuously with autowatching", [ "karma:chrome" ]);
  grunt.registerTask("e2e", [ "protractor:all" ]);

  // TS compiler with fast incremental watcher
  grunt.registerTask("tsc", [ "typescript:dev" ]);

  // distribution tasks

  grunt.registerTask("default", [
    "bower",
    "wiredep",
    "typescript:base",
    "rename",
    "karma:unit",
    "ngAnnotate:app"
  ]);

  grunt.registerTask("dist", [
    "default",
    "copy:html",
    "useminPrepare",
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'usemin',
    'cacheBust'
  ]);

};
