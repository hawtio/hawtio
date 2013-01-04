/*
 * grunt-type
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Alvaro Vilanova
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    lint: {
      all: ['grunt.js', 'tasks/*.js', '<config:nodeunit.tasks>']
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      test: ['tmp']
    },

    // Configuration to be run (and then tested).
    type: {
      compile: {
        files: {
          'tmp/simple.js': ['test/fixtures/compile/type1.ts'],
          'tmp/concat.js': ['test/fixtures/compile/type2.ts',
                            'test/fixtures/compile/type1.ts'],
          'tmp/many/*.js': ['test/fixtures/compile/**/*.ts']
        }
      },
      flatten: {
        options: {
          flatten: true
        },
        files: {
          'tmp/flatten/*.js': ['test/fixtures/compile/**/*.ts']
        }
      },
      es5: {
        options: {
          target: 'ES5'
        },
        files: {
          'tmp/es5.js': ['test/fixtures/es5.ts']
        }
      },
      amd: {
        options: {
          module: 'amd'
        },
        files: {
          'tmp/amd.js': ['test/fixtures/amd.ts']
        }
      },
      refs: {
        options: {
          reference: ['test/fixtures/references/*.d.ts']
        },
        files: {
          'tmp/ref.js': ['test/fixtures/ref.ts']
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tasks: ['test/*_test.js']
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // The clean plugin helps in testing.
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Whenever the 'test' task is run, first clean the 'tmp' dir, then run this
  // plugin's task(s), then test the result.
  grunt.renameTask('test', 'nodeunit');
  grunt.registerTask('test', 'clean type nodeunit');

  // By default, lint and run all tests.
  grunt.registerTask('default', 'lint test');
};
