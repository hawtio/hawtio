module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Project configuration.
  var webapp_outdir = grunt.option('webapp_outdir');

  if (!webapp_outdir) {
    webapp_outdir = 'target/hawtio-web-1.3-SNAPSHOT'
    grunt.option('webapp_outdir', webapp_outdir);
  }

  grunt.initConfig({
    watch: {
      app: {
        files: ['src/main/webapp/**',
                '!src/main/webapp/**/*.ts',
                'GruntFile.js',
                "<%= grunt.option('webapp_outdir') %>/lib/*.js",
                "<%= grunt.option('webapp_outdir') %>/app/app.js"],
        tasks: [],
        options: {
          livereload: true,
          spawn: false
        }
      }
    }
  });

  //grunt.config.set('currentTasks', fullBuild);

  // watch source for changes
  grunt.registerTask('default', ['watch']);

};
