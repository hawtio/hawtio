var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    eventStream = require('event-stream'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    map = require('vinyl-map'),
    fs = require('fs'),
    path = require('path'),
    sequence = require('run-sequence'),
    size = require('gulp-size'),
    uri = require('urijs'),
    s = require('underscore.string'),
    argv = require('yargs').argv,
    logger = require('js-logger'),
    hawtio = require('hawtio-node-backend'),
    tslint = require('gulp-tslint'),
    tslintRules = require('./tslint.json');

var plugins = gulpLoadPlugins({});
var pkg = require('./package.json');

var config = {
  proxyPort: argv.port || 8181,
  targetPath: argv.path || '/hawtio/jolokia',
  logLevel: argv.debug ? logger.DEBUG : logger.INFO,
  main: '.',
  ts: ['plugins/**/*.ts'],
  less: './less/**/*.less',
  templates: ['plugins/**/*.html'],
  templateModule: pkg.name + '-templates',
  dist: './dist/',
  js: pkg.name + '.js',
  css: pkg.name + '.css',
  tsProject: plugins.typescript.createProject({
    target: 'ES5',
    declaration: true,
    noResolve: false,
    removeComments: true
  }),
  tsLintOptions: {
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

gulp.task('bower', function() {
  return gulp.src('index.html')
    .pipe(wiredep({}))
    .pipe(gulp.dest('.'));
});

/** Adjust the reference path of any typescript-built plugin this project depends on */
gulp.task('path-adjust', function() {
  return eventStream.merge(
    gulp.src('libs/**/includes.d.ts')
      .pipe(plugins.debug({ title: 'path adjust' }))
      .pipe(plugins.replace(/"\.\.\/libs/gm, '"../../../libs'))
      .pipe(gulp.dest('libs')),
    gulp.src('libs/**/defs.d.ts')
      .pipe(plugins.debug({ title: 'path adjust' }))
      .pipe(plugins.replace(/"libs/gm, '"../../libs'))
      .pipe(gulp.dest('libs'))
  );
});

gulp.task('clean-defs', function() {
  return gulp.src('defs.d.ts', { read: false })
    .pipe(plugins.clean());
});

gulp.task('tsc', ['clean-defs'], function() {
  var cwd = process.cwd();
  var tsResult = gulp.src(config.ts)
    .pipe(plugins.if(config.sourceMap, plugins.sourcemaps.init()))
    .pipe(config.tsProject())
    .on('error', plugins.notify.onError({
      message: '<%= error.message %>',
      title: 'Typescript compilation error'
    }));

  return eventStream.merge(
    tsResult.js
      .pipe(plugins.if(config.sourceMap, plugins.sourcemaps.write()))
      .pipe(gulp.dest('.')),
    tsResult.dts
      .pipe(plugins.rename('defs.d.ts'))
      .pipe(gulp.dest('.')));
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
  return gulp.src(['templates.js', 'compiled.js', 'target/site/'], { read: false })
    .pipe(plugins.clean());
});

gulp.task('watch', ['build'], function() {
  plugins.watch(['libs/**/*.js', 'libs/**/*.css', 'index.html', config.dist + '/' + config.js], function() {
    gulp.start('reload');
  });
  plugins.watch(['libs/**/*.d.ts', config.ts, config.templates], function() {
    gulp.start(['tsc', 'template', 'concat', 'clean']);
  });
  plugins.watch(config.less, function() {
    gulp.start('less', 'reload');
  })
});

gulp.task('connect', ['watch'], function() {
  /*
   * Example of fetching a URL from the environment, in this case for kubernetes
  var kube = uri(process.env.KUBERNETES_MASTER || 'http://localhost:8080');
  console.log("Connecting to Kubernetes on: " + kube);
  */

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
    /*
    // proxy to a service, in this case kubernetes
    {
      proto: kube.protocol(),
      port: kube.port(),
      hostname: kube.hostname(),
      path: '/services/kubernetes',
      targetPath: kube.path()
    },
    // proxy to a jolokia instance
    {
      proto: kube.protocol(),
      hostname: kube.hostname(),
      port: kube.port(),
      path: '/jolokia',
      targetPath: '/hawtio/jolokia'
    }
    */
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
  hawtio.use('/', function(req, res, next) {
    var path = req.originalUrl;
    if (!s.startsWith(path, '/hawtio/')) {
      res.redirect('/hawtio/');
    } else {
      next();
    }
  });
  /*
   * Example middleware that returns a 404 for templates
   * as they're already embedded in the js
  hawtio.use('/', function(req, res, next) {
          var path = req.originalUrl;
          // avoid returning these files, they should get pulled from js
          if (s.startsWith(path, '/plugins/') && s.endsWith(path, 'html')) {
            console.log("returning 404 for: ", path);
            res.statusCode = 404;
            res.end();
          } else {
            console.log("allowing: ", path);
            next();
          }
        });
        */
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
        'libs/**/*.woff',
        'libs/**/*.woff2',
        'libs/**/*.ttf',
        'libs/**/fonts/*.eot',
        'libs/**/fonts/*.svg'
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
      css: [plugins.cleanCss(), 'concat'],
      js: [plugins.sourcemaps.init({
            loadMaps: true
          }),
          'concat',
          plugins.uglify(), 
          plugins.rev(),
          plugins.sourcemaps.write('./')]
    }))
    .pipe(plugins.debug({ title: 'usemin' }))
    // adjust image paths here
    // convert: 'libs/*/img/' | '/img/' | '../img/'  -> 'img/'
    .pipe(plugins.replace(/"libs\/[^/]+\/img\//gm, '"img/'))
    .pipe(plugins.replace(/\/img\/|\.\.\/img\//gm, 'img/'))
    // convert: '../fonts/' -> 'fonts/'
    .pipe(plugins.replace(/\.\.\/fonts\//gm, 'fonts/'))
    .pipe(gulp.dest('target/site'));
});

gulp.task('404', ['usemin'], function() {
  return gulp.src('target/site/index.html')
    .pipe(plugins.rename('404.html'))
    .pipe(gulp.dest('target/site'));
});

gulp.task('copy-images', function() {
  var dirs = fs.readdirSync('./libs');
  var patterns = [];
  dirs.forEach(function(dir) {
    var path = './libs/' + dir + '/img';
    try {
      if (fs.statSync(path).isDirectory()) {
        console.log('found image dir: ', path);
        var pattern = 'libs/' + dir + '/img/**';
        patterns.push(pattern);
      }
    } catch (e) {
      // ignore, file does not exist
    }
  });
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

gulp.task('build', callback => sequence(['bower', 'path-adjust', 'tsc', 'less', 'template', 'concat'], 'clean', callback));

gulp.task('site', callback => sequence('clean', ['site-fonts', 'site-files', 'usemin', '404', 'copy-images'], callback));

gulp.task('mvn', callback => sequence('build', 'site'));

gulp.task('default', callback => sequence('connect', callback));
