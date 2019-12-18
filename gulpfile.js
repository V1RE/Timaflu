const gulp = require("gulp");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify-es").default;
const del = require("del");

// Compile Sass to CSS
gulp.task("sassCompile", function() {
  return gulp
    .src("./resources/sass/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./public/build/css"));
});

// Compress JS files to Build
gulp.task("jsCompress", function() {
  return gulp
    .src("./resources/js/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("./public/build/js"));
});

// Uncompress JS files from Build for debugging
gulp.task("jsUncompress", function() {
  return gulp
    .src("./resources/js/*.js")
    .pipe(del("public/build/js", { force: true }))
    .pipe(gulp.dest("./public/build/js"));
});

// Cleans Build folder
gulp.task("clean", function() {
  return del("public/build/**", { force: true });
});

// Default task
gulp.task("default", gulp.series("clean", "sassCompile", "jsCompress"));
