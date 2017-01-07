var gulp = require('gulp'); 
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');

gulp.task('jshint', function() {
  gulp.src('./src/scripts/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('styles', function() {
  gulp.src('./styles/sass/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('./styles/css'));
});

gulp.task('nodemon', function () {
  nodemon({
    script: 'server.js'
  , ext: 'js html'
  , env: { 'NODE_ENV': 'development' }
  })
})

gulp.task('default',['jshint', 'styles', 'nodemon']);

