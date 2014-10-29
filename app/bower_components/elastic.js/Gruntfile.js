'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n\n'
    },
    concat: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: [
          'src/pre.js',
          'src/util.js',
          'src/facet/*.js',
          'src/filter/*.js',
          'src/index/*.js',
          'src/query/*.js',
          'src/admin/*.js',
          'src/search/**/*.js',
          'src/utils.js',
          'src/post.js'
        ],
        dest: 'dist/elastic.js'
      },
      client_node: {
        src: [
          'src/clients/elastic-node-client.js'
        ],
        dest: 'dist/elastic-node-client.js'
      },
      client_jquery: {
        src: [
          'src/clients/elastic-jquery-client.js'
        ],
        dest: 'dist/elastic-jquery-client.js'
      },
      client_extjs: {
        src: [
          'src/clients/elastic-extjs-client.js'
        ],
        dest: 'dist/elastic-extjs-client.js'
      },
      client_angular: {
        src: [
          'src/clients/elastic-angular-client.js'
        ],
        dest: 'dist/elastic-angular-client.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>',
        ascii_only: true
      },
      dist: {
        src: ['<%= concat.dist.dest %>'],
        dest: 'dist/elastic.min.js'
      },
      client_jquery: {
        src: ['src/clients/elastic-jquery-client.js'],
        dest: 'dist/elastic-jquery-client.min.js'
      },
      client_extjs: {
        src: ['src/clients/elastic-extjs-client.js'],
        dest: 'dist/elastic-extjs-client.min.js'
      },
      client_angular: {
        src: ['src/clients/elastic-angular-client.js'],
        dest: 'dist/elastic-angular-client.min.js'
      }
    },
    nodeunit: {
      files: ['tests/**/*.js']
    },
    jshint: {
      options: {
        bitwise: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        indent: 2,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        globalstrict: true,
        globals: {
          exports: true,
          module: false
        }
      },
      files: [
        'Gruntfile.js', 
        '<%= concat.dist.dest %>', 
        'tests/**/*.js',
        'src/clients/*.js'
      ]
    }
  });

  // load plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Default task.
  grunt.registerTask('default', ['concat', 'jshint', 'nodeunit', 'uglify']);

};
