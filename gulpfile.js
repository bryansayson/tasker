var gulp = require('gulp');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var jsFiles = 'src/scripts/**/*.js';
var angularFiles = 'src/scripts/angular/**/*.js';
var angularDest = 'src/scripts/js';
var jsDest = 'public/dist/scripts';

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

gulp.task('nodemon', function() {
    nodemon({
        script: 'server.js',
        ext: 'js html',
        env: {
            'NODE_ENV': 'development'
        }
    });
});

gulp.task('angularHandler', function() {
    gulp.src(angularFiles)
        .pipe(concat('handledTasker.js'))
        .pipe(ngAnnotate())
        .pipe(gulp.dest(angularDest))
});

gulp.task('scripts', function() {
    gulp.src(jsFiles)
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(jsDest))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(jsDest));
});

gulp.task('default', ['jshint', 'styles', 'nodemon', 'angularHandler', 'scripts']);
