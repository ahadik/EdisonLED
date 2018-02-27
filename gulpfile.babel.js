'use strict';

//////////////////////////////
// Requires
//////////////////////////////
var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    importOnce = require('node-sass-import-once'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    browserSync = require('browser-sync'),
    babel = require('gulp-babel'),
    svgo = require('imagemin-svgo');


//////////////////////////////
// Variables
//////////////////////////////
var dirs = {
  'js': {
    'src': 'src/**/*.js',
    'entry': './src/scripts/main.js',
    'dist': 'dist/scripts/'
  },
  'dist': 'dist/',
  'sass': {
    root: 'src/styles/styles.scss',
    all: 'src/styles/**/*.scss'
  },
  'images': {'imgs': 'src/assets/**/*'},
  'views': 'src/views/**/*.html'
};

var isCI = (typeof process.env.CI === 'undefined') ? process.env.CI : false;

//////////////////////////////
// Update BrowserSync
//////////////////////////////
browserSync = browserSync.create();

//////////////////////////////
// JavaScript Lint Tasks
//////////////////////////////

gulp.task('js-bundle', () => {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: dirs.js.entry,
    debug: true
  });

  return b.bundle()
    .pipe(source('script.min.js'))
    .pipe(buffer())
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dirs.js.dist))
    .on('end', browserSync.reload);
});

//watch all client side JS and trigger client-side pack on change
gulp.task('js-bundle:watch', function(){
  gulp.watch(dirs.js.src, ['js-bundle']);
});

//////////////////////////////
// HTML Tasks
//////////////////////////////


// Copy components over directly
gulp.task('html', () => {
  gulp.src([dirs.views]).pipe(gulp.dest(dirs.dist));
});

gulp.task('html:watch', function(){
  gulp.watch(dirs.views, ['html']);
});

//////////////////////////////
// Sass Tasks
//////////////////////////////
gulp.task('sass', function () {
  gulp.src(dirs.sass.root)
    .pipe(gulpif(!isCI, sourcemaps.init()))
    .pipe(sass({
      'outputStyle': isCI ? 'expanded' : 'compressed',
      'includePaths': [
        'src/styles',
        'node_modules'
      ],
      'importer': importOnce,
      'importOnce': {
        'index': true,
        'css': true
      }
    }))
    .pipe(autoprefixer())
    .pipe(gulpif(!isCI, sourcemaps.write('maps')))
    .pipe(gulp.dest(dirs.dist + 'css'))
    .pipe(browserSync.stream());
});

gulp.task('sass:watch', function() {
  gulp.watch(dirs.sass.all, ['sass']);
});

//////////////////////////////
// Image Tasks
//////////////////////////////
gulp.task('images', function() {
  gulp.src(dirs.images.imgs)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }]
    }))
    .pipe(gulp.dest(dirs.dist + '/assets'));
});

gulp.task('images:watch', function () {
  gulp.watch(dirs.images.imgs, ['images']);
});

//////////////////////////////
// Browser Sync Task
//////////////////////////////
gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: './dist/'
    }
  });
});

//////////////////////////////
// Running Tasks
//////////////////////////////
gulp.task('build', ['js-bundle', 'html', 'sass', 'images']);

gulp.task('watch', ['js-bundle:watch', 'html:watch', 'sass:watch', 'images:watch']);

gulp.task('default', ['browser-sync', 'build', 'watch']);
