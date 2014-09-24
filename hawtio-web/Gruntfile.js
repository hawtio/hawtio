
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
        options: {
          comments: true,
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

    uglify: {
      dist: {
        options: {
          // Reference to the source map TypeScript created.
          sourceMapIn: 'src/main/webapp/app/app.js.map',
          // Creates our new source map after minifying.
          sourceMap: 'src/main/webapp/app/app.min.map',
          // The root folder where the TypeScript live.
          sourceMapRoot: 'src/main/webapp/app/**/*.ts'
        },
        files: {
          'src/main/webapp/app/app.min.js': ['src/main/webapp/app/app.js']
        }
      }
    },

    // grunt-contrib-watch
    watch: {
      tsc: {
        files: [ "src/main/webapp/app/**/*.ts" ],
        tasks: [ "typescript:base" ]
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
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-angular-modules-graph');
  grunt.loadNpmTasks('grunt-graphviz');
  grunt.loadNpmTasks('grunt-contrib-uglify');


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
    grunt.registerTask("tsc", "Runs TypeScript compiler", [ "typescript:base", "uglify:dist" ]);
  }

};
