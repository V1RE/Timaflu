const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify-es').default;

// Separate tasks
gulp.task('sassCompile', function() {
  return gulp.src('./resources/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'))
});

gulp.task('jsCompress', function() {
  return gulp.src('./resources/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'))
});

gulp.task('jsUncompress', function() {
  return gulp.src('./resources/js/*.js')
    .pipe(gulp.dest('./public/js'))
});

// Combined tasks
gulp.task('default', gulp.series('sassCompile', 'jsCompress'));