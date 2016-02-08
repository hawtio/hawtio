
module.exports = function(grunt) {
  var outputDir = grunt.option('directory') || 'target';
  grunt.log.writeln("Building hawt.io api docs to ", outputDir);

  grunt.config.init({
    pkg: grunt.file.readJSON("package.json"),
    typedoc: {
      build: {
        options: {
          name: 'hawtio',
          readme: '../README.md',
          module: "commonjs",
          target: "es5",
          out: outputDir
        },
        src: [ "../hawtio-web/src/main/**/*.ts" ]
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask("default", [
    "typedoc:build",
  ])
};
