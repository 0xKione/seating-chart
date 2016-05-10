'use strict';

var gulp = require('gulp');

var assign = Object.assign || require('object-assign');
var babel = require('gulp-babel');
var batch = require('gulp-batch');
var concat = require('gulp-concat');
var cssmin = require('gulp-minify-css');
var del = require('del');
var jsmin = require('gulp-uglify');
var lint = require('gulp-eslint');
var merge = require('merge-stream');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var vinylPaths = require('vinyl-paths');
var watch = require('gulp-watch');

var babelOptions = {
  modules: 'es6',
  moduleIds: false,
  comments: false,
  compact: false,
  stage: 2
};

var devDependencies = {
  js: [
    './bower_components/jquery/dist/jquery.js',
    './bower_components/jquery-ui/jquery-ui.js',
    './bower_components/bootstrap/dist/js/bootstrap.js',
    './bower_components/papaparse/papaparse.js',
    './bower_components/underscore/underscore.js'
  ],
  css: [
    './bower_components/bootstrap/dist/css/bootstrap.css'
  ],
  fonts: [
    './bower_components/bootstrap/dist/fonts/*.*'
  ]
};

gulp.task('dependencies', function() {
  var js = gulp.src(devDependencies.js)
    .pipe(gulp.dest('./dist/js/vendor'));
    
  var css = gulp.src(devDependencies.css)
    .pipe(gulp.dest('./dist/css/vendor'));
    
  var fonts = gulp.src(devDependencies.fonts)
    .pipe(gulp.dest('./dist/css/fonts'));
    
  var images = gulp.src(['./images/*.*', './images/**/*.*'])
    .pipe(gulp.dest('./dist/images/'));
  
  return merge(js, css, fonts, images);
});

gulp.task('clean', function() {
  return gulp.src('./dist/')
    .pipe(vinylPaths(del));
});

gulp.task('build', function() {
  return gulp.src(['./js/Guest.js', './js/Table.js', './js/index.js'])
    .pipe(concat('index.js'))
    //.pipe(babel(assign({}, babelOptions, { modules: 'amd' })))
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('lint', function() {
  return gulp.src('./dist/js/*.js')
    .pipe(lint())
    .pipe(lint.format())
    .pipe(lint.failOnError());
});

gulp.task('sass', function() {
  var normal = gulp.src(['./sass/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('stylesheet.css'))
    .pipe(gulp.dest('./dist/css/'));
    
  return normal;
});

gulp.task('minify-js', function() {
  return gulp.src(['./dist/js/vendor/*.js', './dist/js/*.js'])
    .pipe(jsmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('minify-css', function() {
  var shared = gulp.src('./dist/css/vendor/*.css')
    .pipe(cssmin({ keepSpecialComments: 0 }))
    .pipe(rename({ basename: 'vendor', suffix: '.min' }))
    .pipe(gulp.dest('./dist/css/vendor'));
    
  var normal = gulp.src('./dist/css/*.css')
    .pipe(cssmin({ keepSpecialComments: 0 }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/css/'));
  
  return merge(shared, normal);
});

gulp.task('watch', function() {
    watch(['index.html', 'js/*.js', 'sass/*.scss'], batch(function(events, done) {
        gulp.start('default', done);
    }));
});

gulp.task('default', function(callback) {
  return runSequence(
    'clean',
    'dependencies',
    'build',
    'sass',
    callback
  );
});

gulp.task('production', function(callback) {
  return runSequence(
    'clean',
    'dependencies',
    'build',
    'sass',
    ['minify-js', 'minify-css'],
    callback
  );
});
