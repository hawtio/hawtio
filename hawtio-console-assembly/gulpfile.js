const gulp = require('gulp'),
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
  hawtio = require('@hawtio/node-backend'),
  tslint = require('gulp-tslint'),
  tslintRules = require('./tslint.json'),
  exec = require('child_process').exec;

const plugins = gulpLoadPlugins({});

const config = {
  proxyPort: argv.port || 8181,
  targetPath: argv.path || '/hawtio/jolokia',
  logLevel: argv.debug ? logger.DEBUG : logger.INFO,
  keycloak: argv.keycloak ? 'true' : 'false',
  app: 'app/',
  src: 'app/src/',
  srcTs: 'app/src/**/*.ts',
  srcLess: 'app/src/**/*.less',
  srcTemplates: 'app/src/**/!(index|login).html',
  docTemplates: '../@(CHANGES|FAQ).md',
  templateModule: 'hawtio-console-assembly-templates',
  temp: 'temp/',
  dist: 'dist/',
  distJs: 'dist/js',
  distCss: 'dist/css',
  distFonts: 'dist/fonts',
  distLibs: 'dist/libs',
  distImg: 'dist/img',
  js: 'hawtio-console-assembly.js',
  css: 'hawtio-console-assembly.css',
  tsProject: plugins.typescript.createProject('tsconfig.json'),
  tsLintOptions: {
    rulesDirectory: './tslint-rules/'
  },
  sourceMap: argv.sourcemap
};

var normalSizeOptions = {
  showFiles: true
}, gZippedSizeOptions = {
  showFiles: true,
  gzip: true
};

//------------------------------------------------------------------------------
// build tasks
//------------------------------------------------------------------------------

gulp.task('clean', function () {
  return gulp.src(['dist', 'temp'], { read: false })
    .pipe(plugins.clean());
});

gulp.task('tsc', function () {
  return config.tsProject.src()
    .pipe(plugins.debug({ title: 'tsc' }))
    .pipe(plugins.if(config.sourceMap, plugins.sourcemaps.init()))
    .pipe(config.tsProject())
    .js
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.debug({ title: 'tsc js' }))
    .pipe(plugins.if(config.sourceMap, plugins.sourcemaps.write()))
    .pipe(gulp.dest(config.temp));
});

gulp.task('template', function () {
  return gulp.src(config.srcTemplates)
    .pipe(plugins.debug({ title: 'template' }))
    .pipe(plugins.angularTemplatecache({
      filename: 'templates.js',
      root: config.src,
      standalone: true,
      module: config.templateModule,
      templateFooter: '}]); hawtioPluginLoader.addModule("' + config.templateModule + '");'
    }))
    .pipe(gulp.dest(config.temp));
});

gulp.task('template-docs', function () {
  return gulp.src(config.docTemplates)
    .pipe(plugins.angularTemplatecache({
      filename: 'doc-templates.js',
      root: 'plugins/help/doc',
      standalone: true,
      module: config.templateModule,
      templateFooter: '}]); hawtioPluginLoader.addModule("' + config.templateModule + '");'
    }))
    .pipe(gulp.dest(config.temp));
});

gulp.task('concat', function () {
  var gZipSize = size(gZippedSizeOptions);
  var license = tslintRules.rules['license-header'][1];
  return gulp.src(config.temp + '*.js')
    .pipe(plugins.concat(config.js))
    .pipe(plugins.header(license))
    .pipe(size(normalSizeOptions))
    .pipe(gZipSize)
    .pipe(gulp.dest(config.distJs));
});

gulp.task('less', function () {
  return gulp.src(config.srcLess)
    .pipe(plugins.less())
    .pipe(plugins.concat(config.css))
    .pipe(gulp.dest(config.distCss));
});

gulp.task('usemin', function () {
  return gulp.src(config.src + '@(index|login).html')
    .pipe(plugins.usemin({
      css: [plugins.cleanCss(), 'concat'],
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
    .pipe(gulp.dest(config.dist));
});

gulp.task('install-dependencies', function (cb) {
  exec(`cd ${config.app} && yarn install --prod --flat --frozen-lockfile && cd ..`, function (error, stdout, stderr) {
    if (error) {
      console.log(stderr);
    } else {
      gulp.src(config.app + '/node_modules/**/*')
        .pipe(gulp.dest(config.distLibs));
    }
    cb(error);
  });
});

gulp.task('copy-images', function () {
  var hawtioDependencies = config.app + 'node_modules/@hawtio';
  var dirs = fs.readdirSync(hawtioDependencies);
  var patterns = [];
  dirs.forEach(function (dir) {
    var path = hawtioDependencies + '/' + dir + '/dist/img';
    try {
      if (fs.statSync(path).isDirectory()) {
        console.log('found image dir: ', path);
        var pattern = hawtioDependencies + '/' + dir + '/dist/img/**/*';
        patterns.push(pattern);
      }
    } catch (e) {
      // ignore, file does not exist
    }
  });
  // Add PatternFly images package in dist
  patterns.push(config.app + 'node_modules/patternfly/dist/img/**/*');
  return gulp.src(patterns)
    .pipe(plugins.debug({ title: 'image copy' }))
    .pipe(gulp.dest(config.distImg));
});

gulp.task('404', ['usemin'], function () {
  return gulp.src(config.dist + 'index.html')
    .pipe(plugins.rename('404.html'))
    .pipe(gulp.dest(config.dist));
});

gulp.task('copy-config', function () {
  return gulp.src(config.src + '*.json')
    .pipe(gulp.dest(config.dist));
});

//------------------------------------------------------------------------------
// serve tasks
//------------------------------------------------------------------------------

gulp.task('connect', function () {
  hawtio.setConfig({
    logLevel: config.logLevel,
    port: 2772,
    proxy: '/hawtio/proxy',
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
      path: '/hawtio/',
      dir: './dist/'
    }],
    fallback: './dist/index.html',
    liveReload: {
      enabled: true
    }
  });

  hawtio.use('/', (req, res, next) => {
    if (!s.startsWith(req.originalUrl, '/hawtio/')
      || s.startsWith(req.originalUrl, '/hawtio/jvm/')
      || s.startsWith(req.originalUrl, '/hawtio/help')
      || s.startsWith(req.originalUrl, '/hawtio/preferences')) {
      res.redirect('/hawtio/');
    } else {
      next();
    }
  });

  hawtio.use('/hawtio/refresh', (req, res, next) => {
    res.set('Content-Type', 'text/html;charset=UTF-8');
    res.send('ok');
  });

  // used for hawtio-login
  hawtio.use('/hawtio/auth/login', (req, res, next) => {
    // login always succeeds
    res.set('Content-Type', 'application/json');
    res.send('{}');
  });

  // used for hawtio-login
  hawtio.use('/hawtio/auth/logout', (req, res, next) => {
    res.redirect('/hawtio/login.html');
  });

  // used for hawtio-login
  hawtio.use('/hawtio/user', (req, res, next) => {
    // login always succeeds
    res.set('Content-Type', 'application/json');
    res.send('"user"');
  });

  // used for hawtio-login
  hawtio.use('/hawtio/keycloak/enabled', (req, res, next) => {
    res.set('Content-Type', 'application/json');
    res.send(config.keycloak);
  });

  // used for hawtio-login
  hawtio.use('/hawtio/keycloak/client-config', (req, res, next) => {
    res.set('Content-Type', 'application/json');
    res.send(`
      {
        "clientId": "hawtio-client",
        "url": "http://localhost:18080/auth",
        "realm": "hawtio-demo"
      }
    `);
  });

  // used for hawtio-login
  hawtio.use('/hawtio/keycloak/validate-subject-matches', (req, res, next) => {
    res.set('Content-Type', 'application/json');
    res.send('true');
  });

  hawtio.listen(function (server) {
    var host = server.address().address;
    var port = server.address().port;
    console.log("started from gulp file at", host, ":", port);
  });
});

gulp.task('watch', function () {
  gulp.watch([
    config.distCss + '*',
    config.distJs + '*',
    config.dist + '@(index|login).html'
  ], ['reload']);
  gulp.watch([config.srcTs, config.srcTemplates], ['tsc', 'template', 'concat']);
  gulp.watch(config.srcLess, ['less']);
  gulp.watch(config.src + '@(index|login).html', ['usemin']);
});

gulp.task('reload', function () {
  gulp.src('dist/@(index|login).html')
    .pipe(hawtio.reload());
});

//------------------------------------------------------------------------------
// main tasks
//------------------------------------------------------------------------------

gulp.task('build', callback => sequence('clean', 'tsc', 'template', 'template-docs', 'concat', 'less', 'usemin',
  'install-dependencies', 'copy-images', '404', 'copy-config', callback));

gulp.task('default', callback => sequence('build', ['connect', 'watch']));
