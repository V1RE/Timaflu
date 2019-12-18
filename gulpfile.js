const del = require("del");
const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify-es").default;

// Files to watch for build
const watcher = ["./resources/js/**/*.js", "./resources/js/**/*.scss"];

// Compile Sass to CSS and generate sourcemap
gulp.task("sassCompile", function() {
  return gulp
    .src("./resources/sass/*.scss")
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./public/build/css"));
});

// Compress JS files to Build
gulp.task("jsCompress", function() {
  return gulp
    .src("./resources/js/*.js")
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
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

// Build task
gulp.task("build", gulp.series("clean", "sassCompile", "jsCompress"));

// Default task
gulp.task("default", gulp.watch(watcher, gulp.series("build")));
