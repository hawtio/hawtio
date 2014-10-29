var packageJSON = require('./package.json');
var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var qunit = require('gulp-qunit');
var jshint = require('gulp-jshint');
var size = require('gulp-size');
var git = require('gulp-git');
var spawn = require('child_process').spawn;
 
var version = packageJSON.version;
var srcFile = 'src/logger.js';

gulp.task('src_version', function () {
	return gulp.src(srcFile)
		.pipe(replace(/VERSION = "[^"]+"/, 'VERSION = "' + version + '"'))
		.pipe(gulp.dest('src'));
});

gulp.task('bower_version', function () {
	return gulp.src('bower.json')
		.pipe(replace(/version": "[^"]+"/, 'version": "' + version + '"'))
		.pipe(gulp.dest('.'));
});

gulp.task('version', [ 'src_version', 'bower_version' ]);

gulp.task('lint', [ 'version' ], function () {
	return gulp.src(srcFile)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('test', [ 'version' ], function () {
	return gulp.src('test-src/index.html')
		.pipe(qunit());
});

gulp.task('minify', [ 'version' ], function () {
	return gulp.src(srcFile)
		.pipe(size({ showFiles: true }))
		.pipe(uglify())
		.pipe(rename('logger.min.js'))
		.pipe(size({ showFiles: true }))
		.pipe(gulp.dest('src'));
});

gulp.task('release', [ 'push_tag', 'publish_npm' ]);

gulp.task('push_tag', function (done) {
	git.tag(version, 'v' + version);

	spawn('git', [ 'push', '--tags' ], { stdio: 'inherit' })
		.on('close', done);
});

gulp.task('publish_npm', function (done) {
	spawn('npm', [ 'publish' ], { stdio: 'inherit' })
		.on('close', done);
});

gulp.task('default', [ 'version', 'lint', 'test', 'minify' ]);
