const gulp          = require('gulp'),
    eventStream     = require('event-stream'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    map             = require('vinyl-map'),
    fs              = require('fs'),
    path            = require('path'),
    sequence        = require('run-sequence'),
    size            = require('gulp-size'),
    uri             = require('urijs'),
    s               = require('underscore.string'),
    argv            = require('yargs').argv,
    logger          = require('js-logger'),
    hawtio          = require('@hawtio/node-backend'),
    tslint          = require('gulp-tslint'),
    tslintRules     = require('./tslint.json');

const plugins = gulpLoadPlugins({});

const config = {
  proxyPort      : argv.port || 8181,
  targetPath     : argv.path || '/hawtio/jolokia',
  logLevel       : argv.debug ? logger.DEBUG : logger.INFO,
  main           : '.',
  ts             : ['plugins/**/*.ts'],
  less           : './less/**/*.less',
  templates      : ['plugins/**/*.html'],
  templateModule : 'hawtio-console-assembly-templates',
  dist           : './dist/',
  js             : 'hawtio-console-assembly.js',
  css            : 'hawtio-console-assembly.css',
  dts            : 'hawtio-console-assembly.d.ts',
  tsProject      : plugins.typescript.createProject('tsconfig.json'),
  tsLintOptions  : {
    rulesDirectory: './tslint-rules/'
  },
  sourceMap: argv.sourcemap
};

var normalSizeOptions = {
    showFiles: true
}, gZippedSizeOptions  = {
    showFiles: true,
    gzip: true
};

//------------------------------------------------------------------------------
// build tasks
//------------------------------------------------------------------------------

gulp.task('clean-defs', function() {
  return gulp.src(config.dist + '*.d.ts', { read: false })
    .pipe(plugins.clean());
});

gulp.task('tsc', ['clean-defs'], function() {
  var tsResult = gulp.src(config.ts)
    .pipe(plugins.debug({ title: 'tsc' }))
    .pipe(plugins.if(config.sourceMap, plugins.sourcemaps.init()))
    .pipe(config.tsProject())
    .on('error', plugins.notify.onError({
      message: '<%= error.message %>',
      title: 'Typescript compilation error'
    }));

  return eventStream.merge(
    tsResult.js
      .pipe(plugins.debug({ title: 'tsc js' }))
      .pipe(plugins.if(config.sourceMap, plugins.sourcemaps.write()))
      .pipe(gulp.dest('.')),
    tsResult.dts
      .pipe(plugins.debug({ title: 'tsc dts' }))
      .pipe(plugins.rename(config.dts))
      .pipe(gulp.dest(config.dist)));
});

/*
gulp.task('tslint', function(){
  gulp.src(config.ts)
    .pipe(tslint(config.tsLintOptions))
    .pipe(tslint.report('verbose'));
});

gulp.task('tslint-watch', function(){
  gulp.src(config.ts)
    .pipe(tslint(config.tsLintOptions))
    .pipe(tslint.report('prose', {
      emitError: false
    }));
});
*/

gulp.task('less', function() {
  return gulp.src(config.less)
    .pipe(plugins.less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(plugins.concat(config.css))
    .pipe(gulp.dest('./dist'));
});

gulp.task('template', ['tsc'], function() {
  return gulp.src(config.templates)
    .pipe(plugins.angularTemplatecache({
      filename: 'templates.js',
      root: 'plugins/',
      standalone: true,
      module: config.templateModule,
      templateFooter: '}]); hawtioPluginLoader.addModule("' + config.templateModule + '");'
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('concat', ['template'], function() {
  var gZipSize = size(gZippedSizeOptions);
  var license = tslintRules.rules['license-header'][1];
  return gulp.src(['compiled.js', 'templates.js'])
    .pipe(plugins.concat(config.js))
    .pipe(plugins.header(license))
    .pipe(size(normalSizeOptions))
    .pipe(gZipSize)
    .pipe(gulp.dest(config.dist));
});

gulp.task('clean', function() {
  return gulp.src(['templates.js', 'compiled.js', 'includes.js', 'target/site/'], { read: false })
    .pipe(plugins.clean());
});

gulp.task('watch', ['build'], function() {
  gulp.watch([
    'node_modules/@hawtio/**/dist/*.js',
    'node_modules/@hawtio/**/dist/*.css', 
    'index.html', 
    config.dist + '/' + config.js
  ], ['reload']);
  gulp.watch([
    'node_modules/@hawtio/**/dist/*.d.ts', 
    config.ts, 
    config.templates
  ], ['tsc', 'template', 'concat', 'clean']);
  gulp.watch(config.less, ['less', 'reload']);
});

gulp.task('connect', ['watch'], function() {
  hawtio.setConfig({
    logLevel: config.logLevel,
    port: 2772,
    staticProxies: [
    {
      proto: 'http',
      port: config.proxyPort,
      hostname: 'localhost',
      path: '/hawtio/jolokia',
      targetPath: config.targetPath
    }
    ],
    staticAssets: [{
      path: '/hawtio',
      dir: '.'

    }],
    fallback: 'index.html',
    liveReload: {
      enabled: true
    }
  });
  hawtio.use('/', (req, res, next) => {
    if (!s.startsWith(req.originalUrl, '/hawtio/')) {
      res.redirect('/hawtio/');
    } else {
      next();
    }
  });

  hawtio.use('/hawtio/img', (req, res) => {
    // We may want to serve from other dependencies
    const file = path.join(__dirname, 'node_modules', 'hawtio-integration', 'img', req.url);
    if (fs.existsSync(file)) {
      res.writeHead(200, {
        'Content-Type'       : 'application/octet-stream',
        'Content-Disposition': 'attachment; filename=' + file
      });
      fs.createReadStream(file).pipe(res);
    } else {
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end(`File ${file} does not exist in dependencies`);
    }
  });

  hawtio.listen(function(server) {
    var host = server.address().address;
    var port = server.address().port;
    console.log("started from gulp file at ", host, ":", port);
  });
});

gulp.task('reload', function() {
  gulp.src('.')
    .pipe(hawtio.reload());
});

//------------------------------------------------------------------------------
// site tasks
//------------------------------------------------------------------------------

gulp.task('site-fonts', () =>
  gulp
    .src(
      [
        'node_modules/**/*.woff',
        'node_modules/**/*.woff2',
        'node_modules/**/*.ttf',
        'node_modules/**/fonts/*.eot',
        'node_modules/**/fonts/*.svg'
      ],
      { base: '.' }
    )
    .pipe(plugins.flatten())
    .pipe(plugins.chmod(0o644))
    .pipe(plugins.dedupe({ same: false }))
    .pipe(plugins.debug({ title: 'site font files' }))
    .pipe(gulp.dest('target/site/fonts/', { overwrite: false }))
);

gulp.task('site-files', function() {
  // in case there are hawtio-console-assembly specific images
  return gulp.src(['images/**', 'img/**'], { base: '.' })
    .pipe(plugins.debug({ title: 'site files' }))
    .pipe(gulp.dest('target/site'));
});

gulp.task('usemin', function() {
  return gulp.src('index.html')
    .pipe(plugins.usemin({
      css: [plugins.minifyCss({ keepBreaks: true }), 'concat'],
      js: [
        plugins.sourcemaps.init({
          loadMaps: true
        }),
        'concat',
        plugins.uglify(),
        plugins.rev(),
        plugins.sourcemaps.write('./')
      ]
    }))
    .pipe(plugins.debug({ title: 'usemin' }))
    .pipe(gulp.dest('target/site'));
});

gulp.task('tweak-urls', ['usemin'], () =>
  eventStream.merge(
    gulp.src('target/site/index.html')
      // adjust image paths
      .pipe(plugins.replace(/"node_modules\/[^/]+\/img\//gm, '"img/')),
    gulp.src('target/site/style.css')
      .pipe(plugins.replace(/url\(\.\.\//g, 'url('))
      // tweak fonts URL coming from PatternFly that does not repackage then in dist
      .pipe(plugins.replace(/url\(\.\.\/components\/font-awesome\//g, 'url('))
      .pipe(plugins.replace(/url\(\.\.\/components\/bootstrap\/dist\//g, 'url('))
      .pipe(plugins.replace(/url\(node_modules\/bootstrap\/dist\//g, 'url('))
      .pipe(plugins.replace(/url\(node_modules\/patternfly\/components\/bootstrap\/dist\//g, 'url('))
      .pipe(plugins.debug({ title: 'tweak-urls' }))
    )
    .pipe(gulp.dest('target/site')
  )
);

gulp.task('404', ['usemin'], function() {
  return gulp.src('target/site/index.html')
    .pipe(plugins.rename('404.html'))
    .pipe(gulp.dest('target/site'));
});

gulp.task('copy-images', function() {
  var dirs = fs.readdirSync('./node_modules');
  var patterns = [];
  dirs.forEach(function(dir) {
    var path = './node_modules/' + dir + '/img';
    try {
      if (fs.statSync(path).isDirectory()) {
        console.log('found image dir: ', path);
        var pattern = 'node_modules/' + dir + '/img/**';
        patterns.push(pattern);
      }
    } catch (e) {
      // ignore, file does not exist
    }
  });
  // Add PatternFly images package in dist
  patterns.push('node_modules/patternfly/dist/img/**');
  return gulp.src(patterns)
    .pipe(plugins.debug({ title: 'image copy' }))
    .pipe(gulp.dest('target/site/img'));
});

gulp.task('serve-site', function() {
  hawtio.setConfig({
    port: 2772,
    staticProxies: [
      {
        proto      : 'http',
        hostname   : 'localhost',
        port       : config.proxyPort,
        path       : '/hawtio/jolokia',
        targetPath : config.targetPath
      }
    ],
    staticAssets: [
      {
        path : '/hawtio',
        dir  : 'target/site'
      }
    ],
    liveReload : {
      enabled  : false
    }
  });
  return hawtio.listen(server => console.log('started from gulp file at ',
    server.address().address, ':', server.address().port));
});

gulp.task('build', callback => sequence(['tsc', 'less', 'template', 'concat'], 'clean', callback));

gulp.task('site', callback => sequence('clean', ['site-fonts', 'site-files', 'usemin', 'tweak-urls', '404', 'copy-images'], callback));

gulp.task('mvn', callback => sequence('build', 'site'));

gulp.task('default', callback => sequence('connect', callback));
