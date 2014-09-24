
module.exports = function(grunt) {

  grunt.log.writeln("Building hawt.io");

  grunt.config.init({

    pkg: grunt.file.readJSON("package.json"),

    /* task configuration */

    // grunt-contrib-connect
    connect: {
      devserver: {
        options: {
          port: 8010,
          base: 'src/main/webapp',
//          middleware: function(connect, options) {
//          },
          keepalive: true
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
//        dest: ".tscache/tsc",
        options: {
          comments: true,
          module: "commonjs",
          target: "ES5",
          declaration: false,
          watch: grunt.option("watch") ? {
            path: "src/main/webapp/app",
//            after: [ "concat:appjs" ],
            atBegin: true
          } : false
        }
      }
    },

    // grunt-ts (~10 seconds)
    ts: {
      build: {
        src: [ "src/main/d.ts/*.d.ts", "src/main/webapp/app/**/*.ts" ],
        out: "src/main/webapp/app/app.js",
        watch: grunt.option("watch") ? "src/main/webapp/app" : false,
        options: {
          removeComments: false,
          module: "commonjs",
          target: "ES5",
          declaration: false
        }
      }
    },

    // grunt-contrib-watch
    watch: {
      tsc: {
        files: [ "src/main/webapp/app/**/*.ts" ],
        tasks: [ "typescript:base" ]
//        tasks: [ "ts:build" ]
      }
    },

    // grunt-contrib-concat
    concat: {
      options: {
        separator: "//~\n"
      },
      appjs: {
        src: [ ".tscache/tsc/**/*.js" ],
        // it produces app.js in wrong order
        dest: "src/main/webapp/app/app.js"
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
    }

  });

  /* load & register tasks */

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-angular-modules-graph');
  grunt.loadNpmTasks('grunt-graphviz');


  /* task aliases */

  // "grunt webserver" starts a webserver which hosts hawt.io without backend Java server
  // this might be however very useful to connect to existing Jolokia agent
  grunt.registerTask("webserver", "Starts a webserver which hosts hawt.io without backend Java server", [ "connect:devserver" ]);

  grunt.registerTask("test", "Runs unit tests once", [ "karma:unit" ]);
  grunt.registerTask("test-chrome", "Runs unit tests continuously with autowatching", [ "karma:chrome" ]);

  if (grunt.option("watch")) {
//    grunt.registerTask("tsc", "Runs TypeScript compiler", [ "ts:build", "watch:tsc" ]);
    grunt.registerTask("tsc", "Runs TypeScript compiler", [ "typescript:base", "watch:tsc" ]);
  } else {
//    grunt.registerTask("tsc", "Runs TypeScript compiler", [ "ts:build" ]);
    grunt.registerTask("tsc", "Runs TypeScript compiler", [ "typescript:base" ]);
  }

};
