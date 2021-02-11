'use strict';

var gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  argv = require('yargs').argv,
  browserSync = require('browser-sync'),
  concat = require('gulp-concat'),
  del = require('del'),
  size = require('gulp-size'),
  gulpif = require('gulp-if'),
  htmlreplace = require('gulp-html-replace'),
  minifyCSS = require('gulp-minify-css'),
  reload = browserSync.reload,
  rename = require('gulp-rename'),
  runSequence = require('run-sequence'),
  sass = require('gulp-sass'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  sourcemaps = require('gulp-sourcemaps');


var basePaths = {
  src: 'src/',
  root:'build/',
  dest: 'build/assets/'
};

var paths = {
  styles: {
    src: basePaths.src + 'styles/',
    dest: basePaths.dest + 'css/'
  },
  scripts: {
    src: basePaths.src + 'scripts/',
    dest: basePaths.dest + 'js/'
  },
  images: {
    src: basePaths.src + 'images/',
    dest: basePaths.root + 'images/'
  },
  fonts: {
    src: basePaths.src + 'fonts/',
    dest: basePaths.dest + 'fonts/'
  }
};

var scriptsSrc = [
  /** jQuery */
  'src/scripts/vendor/jquery-1.11.3.min.js',

  /** Plugins */
  'src/scripts/plugin/jquery.scrollex.min.js',
  'src/scripts/plugin/jquery.scrolly.min.js',

  /** libs */
  'src/scripts/skel.min.js',
  'src/scripts/util.js',

  /** Page scripts */
  'src/scripts/main.js'
];


gulp.task('clean', function (cb) {
  del([basePaths.root], cb);
});

gulp.task('favicon', function () {
  gulp.src(basePaths.src + 'favicon.ico')
  .pipe(gulp.dest(basePaths.root));
});

gulp.task('html', function () {
  gulp.src(basePaths.src + '*.html')
  .pipe(gulpif(argv.production, htmlreplace({
    'styles_production': 'assets/css/main.min.css',
    'scripts_production': 'assets/js/scripts.min.js'
  })))
  .pipe(gulp.dest(basePaths.root));
});

gulp.task('styles', function () {
  return gulp.src([
    paths.styles.src + '**/*.scss'
  ])
  .pipe(gulpif(argv.dev, sourcemaps.init()))
  .pipe(sass({errLogToConsole: true}))
  .pipe(autoprefixer({
    autoprefixer: {browsers: ['last 2 versions']}
  }))
  .pipe(gulpif(argv.production, rename({suffix: '.min'})))
  .pipe(gulpif(argv.production, minifyCSS({keepBreaks:false})))
  .pipe(gulpif(argv.dev, sourcemaps.write()))
  .pipe(gulp.dest((paths.styles.dest)))
  .pipe(reload({stream: true}))
  .pipe(size({title: 'styles'}));
});

gulp.task('stylesIe', function () {
  gulp.src(paths.styles.src + 'ie/*.*')
  .pipe(gulp.dest(paths.styles.dest + 'ie/'))
  .pipe(size({title: 'stylesIe'}));
});

gulp.task('scripts', function () {
  return gulp.src( scriptsSrc ,  {base: './src/scripts/'})
  .pipe(size({title: 'scripts'}))
  .pipe(gulpif(argv.production, concat('scripts.js')))
  .pipe(gulpif(argv.production, rename({suffix: '.min'})))
  .pipe(gulpif(argv.production, uglify({preserveComments: 'some'})))// Keep some comments
  .pipe(gulp.dest((paths.scripts.dest)));
});

gulp.task('scriptsIe', function () {
  gulp.src(paths.scripts.src + 'ie/*.js')
  .pipe(gulp.dest(paths.scripts.dest + 'ie/'))
  .pipe(size({title: 'scriptsIe'}));
});

gulp.task('images', function () {
  return gulp.src(paths.images.src + '**/*.*')
  .pipe(imagemin({
    progressive: true,
    optimizationLevel : 8,
    svgoPlugins: [
      { convertShapeToPath:false }
    ]
  }))
  .pipe(gulp.dest(paths.images.dest))
  .pipe(size({title: 'images'}));
});

gulp.task('fonts', function () {
  gulp.src(paths.fonts.src + '**/*.*')
  .pipe(gulp.dest(paths.fonts.dest))
  .pipe(size({title: 'fonts'}));
});

gulp.task('server', function() {
  browserSync({
    server: {
      baseDir: basePaths.root
    }
  });
  gulp.watch(paths.styles.src + '**/*.scss', ['styles']);
  gulp.watch(paths.scripts.src + '**/*.js', ['scripts', reload]);
  gulp.watch(paths.images.src + '**/*.*', ['images', reload]);
  gulp.watch(paths.fonts.src + '**/*', ['fonts', reload]);
  gulp.watch(basePaths.src + '**/*.html', ['html', reload]);
});

gulp.task('watch', ['clean'], function (cb) {
  runSequence(['server','html','styles', 'scripts', 'scriptsIe', 'stylesIe', 'images', 'fonts', 'favicon'], cb);
});

gulp.task('build', ['clean'], function (cb) {
  runSequence(['html','styles', 'scripts', 'scriptsIe', 'stylesIe', 'images', 'fonts', 'favicon'], cb);
});
