var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins');

var plugins = gulpLoadPlugins({});
var pkg = require('./package.json');

gulp.task('deploy', function() {
  return gulp.src(['target/sitegen/**', 'target/sitegen/**/*.*', 'target/sitegen/*.*'], { base: 'target/sitegen' })
    .pipe(plugins.debug({title: 'deploy'}))
    .pipe(plugins.ghPages({
      message: "[ci skip] Update site"                     
    }));
});

gulp.task('default', ['deploy']);



