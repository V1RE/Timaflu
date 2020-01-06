const del = require("del");
const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify-es").default;

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
  return del("./public/build/**", { force: true });
});

// Feathericons
gulp.task("feather", function() {
  return gulp
    .src("./node_modules/feather-icons/dist/**")
    .pipe(gulp.dest("./public/build/icons"));
});

gulp.task("jquery", function() {
  return gulp
    .src("./node_modules/jquery/dist/jquery.min.js")
    .pipe(gulp.dest("./public/build/js"));
});

gulp.task("cookies", function() {
  return gulp
    .src("./node_modules/js-cookie/src/js.cookie.js")
    .pipe(uglify())
    .pipe(gulp.dest("./public/build/js"));
});

gulp.task("charts", function() {
  return gulp
    .src("./node_modules/chart.js")
    .pipe(uglify())
    .pipe(gulp.dest("./public/build/js"));
});

// Build task
gulp.task(
  "build",
  gulp.series(
    "clean",
    "sassCompile",
    "jsCompress",
    "feather",
    "jquery",
    "cookies",
    "charts"
  )
);

// Default task
gulp.task("default", function() {
  gulp.watch(
    ["./resources/js/**/*.js", "./resources/sass/**/*.scss"],
    gulp.series("build")
  );
});
