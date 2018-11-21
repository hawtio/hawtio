const gulp = require('gulp');
const eventStream = require('event-stream');
const gulpLoadPlugins = require('gulp-load-plugins');
const map = require('vinyl-map');
const fs = require('fs');
const path = require('path');
const sequence = require('run-sequence');
const size = require('gulp-size');
const uri = require('urijs');
const s = require('underscore.string');
const argv = require('yargs').argv;
const logger = require('js-logger');
const hawtio = require('@hawtio/node-backend');
const tslint = require('gulp-tslint');
const tslintRules = require('./tslint.json');
const exec = require('child_process').exec;
const usemin = require('gulp-usemin');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const rev = require('gulp-rev');
const preprocess = require("gulp-preprocess");

const plugins = gulpLoadPlugins({});

const config = {
  proxyPort: argv.port || 8181,
  targetPath: argv.path || '/hawtio/jolokia',
  logLevel: argv.debug ? logger.DEBUG : logger.INFO,
  keycloak: argv.keycloak ? 'true' : 'false',
  app: 'app/',
  src: 'app/src/',
  srcLess: 'app/src/**/*.less',
  srcTemplates: 'app/src/**/!(index|login).html',
  docTemplates: '../@(CHANGES|FAQ).md',
  templateModule: 'hawtio-console-assembly-templates',
  temp: 'temp/',
  dist: 'dist/',
  distFonts: 'dist/fonts',
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
    .pipe(gulp.dest(config.temp));
});

gulp.task('less', function () {
  return gulp.src(config.srcLess)
    .pipe(plugins.less())
    .pipe(plugins.concat(config.css))
    .pipe(gulp.dest(config.temp));
});

gulp.task('usemin', function () {
  return gulp.src(config.src + '@(index|login).html')
    .pipe(preprocess())
    .pipe(usemin({
      libCss: [cleanCss, rev],
      appCss: [() => cleanCss({ rebaseTo: 'css/css' }), rev],
      libJs: [uglify, rev],
      appJs: [uglify, rev],
      jsAttributes: { defer: true }
    }))
    .pipe(plugins.debug({ title: 'usemin' }))
    .pipe(gulp.dest(config.dist));
});

gulp.task('install-dependencies', function (cb) {
  exec(`cd ${config.app} && yarn install --prod --flat --frozen-lockfile && cd ..`, function (error, stdout, stderr) {
    if (error) {
      console.log(stderr);
    }
    cb(error);
  });
});

gulp.task('copy-fonts', function () {
  return gulp.src('app/node_modules/patternfly/dist/fonts/*')
    .pipe(plugins.debug({ title: 'copy-fonts' }))
    .pipe(gulp.dest(config.distFonts));
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
    .pipe(plugins.debug({ title: 'copy-images' }))
    .pipe(gulp.dest(config.distImg));
});

gulp.task('404', function () {
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
    res.send('"public"');
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
  gulp.watch(config.src + '**/*', ['build']);
  gulp.watch(config.dist + '*', ['reload']);
});

gulp.task('reload', function () {
  gulp.src('dist/@(index|login).html')
    .pipe(hawtio.reload());
});

//------------------------------------------------------------------------------
// main tasks
//------------------------------------------------------------------------------

gulp.task('build', callback => sequence('clean', 'tsc', 'template', 'template-docs', 'concat', 'less',
  'install-dependencies', 'usemin', 'copy-fonts', 'copy-images', '404', 'copy-config', callback));

gulp.task('default', callback => sequence('build', ['connect', 'watch']));
