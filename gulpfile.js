const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify-es').default;
const del = require('del');

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
    .pipe(del('public/js', {force:true}))
    .pipe(gulp.dest('./public/js'))
});

gulp.task('clean', function(){
  return del('public/**', {force:true});
});

// Combined tasks
gulp.task('default', gulp.series('clean','sassCompile', 'jsCompress'));