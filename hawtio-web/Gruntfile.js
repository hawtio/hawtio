
module.exports = function(grunt) {

  grunt.log.writeln("Building hawt.io");

  grunt.config.init({

    pkg: grunt.file.readJSON("package.json"),

    /* task configuration */
    bower: {
      install: {
        options: {
          targetDir: 'src/main/webapp/bower_components',
          copy: false
        }
      }
    },

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
              'main': ['docs/assets/css/bootstrap.css', 'docs/assets/js/bootstrap.js']
            },
            'Font-Awesome': {
              main: ['css/font-awesome.css']
            }
          }
        }
      }
    },

    // grunt-karma
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

    // grunt-typescript (~8 seconds)
    typescript: {
      base: {
        src: [ "src/main/d.ts/*.d.ts", "src/main/webapp/app/**/*.ts" ],
        dest: "src/main/webapp/app/app.js",
        options: {
          comments: false,
          module: "commonjs",
          target: "ES5",
          declaration: true,
          sourceMap: true,
          watch: grunt.option("watch") ? {
            path: "src/main/webapp/app",
            atBegin: true
          } : false
        }
      }
    },

    rename: {
      declaration: {
        src: 'src/main/webapp/app/app.d.ts',
        dest: 'target/hawtio.d.ts'
      }
    },

    ngAnnotate: {
      app: {
        files: {
          'src/main/webapp/app/app.js': ['src/main/webapp/app/app.js']
        }
      }
    },

    uglify: {
      generated: {

      }
    },

    // grunt-contrib-watch
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

    graphviz: {
      graph: {
        files: {
          'target/dependencies-graph.png': 'target/graph.dot'
        }
      }
    },

    useminPrepare: {
      html: 'src/main/webapp/index.html',
      options: {
        dest: 'dist'
      }
    },

    usemin: {
      html: 'dist/**/*.html'
    },

    copy: {
      html: {
        cwd: 'src/main/webapp',
        files: [
          {expand: true, cwd: 'src/main/webapp/', src: ['**/*', '!**/*.ts', '!**/*.map'], dest: 'dist/'}
        ]
      }
    },

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

    express: {
      server: {
        options: {
          port: 9001,
          bases: ['src/main/webapp', 'dist']
        }
      }
    },

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

  // "grunt webserver" starts a webserver which hosts hawt.io without backend Java server
  // this might be however very useful to connect to existing Jolokia agent
  grunt.registerTask("server", "Starts a webserver which hosts hawt.io without backend Java server", [ "express:server" ]);

  grunt.registerTask("webserver", "Starts a webserver which hosts hawt.io without backend Java server", [ "connect:devserver" ]);

  grunt.registerTask("test", "Runs unit tests once", [ "karma:unit" ]);
  grunt.registerTask("test-chrome", "Runs unit tests continuously with autowatching", [ "karma:chrome" ]);

  grunt.registerTask("default", [
    "bower",
    "wiredep",
    "typescript:base",
    "rename",
    "karma:unit",
    "ngAnnotate:app"
  ])

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

  grunt.registerTask("e2e", [
    "protractor:all"
  ]);

};
