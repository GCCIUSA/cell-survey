var gulp = require("gulp"),
plugins = require("gulp-load-plugins")(),
streamqueue = require("streamqueue"),
browserify = require("browserify"),
source = require("vinyl-source-stream"),
buffer = require("vinyl-buffer");

var assetPath = "./src/assets";
var genPath = "./src/assets/gen";

/**
* javascript tasks
*/
var jsSrc = function (isRelease) {
  var libs = gulp.src([
    assetPath + "/libs/jquery/jquery-2.1.4.min.js",
    assetPath + "/libs/bootstrap/js/bootstrap.min.js",
    assetPath + "/libs/angular/angular.min.js",
    assetPath + "/libs/angular/angular-resource.min.js",
    assetPath + "/libs/angular/angular-sanitize.min.js",
    assetPath + "/libs/angular/angular-ui-router.min.js",
    assetPath + "/libs/firebase/firebase.js",
    assetPath + "/libs/firebase/angularfire.min.js",
    assetPath + "/libs/canvasjs/jquery.canvasjs.min.js"
  ]);

  var custom = browserify([require.resolve("babel-polyfill"), assetPath + "/js/config.js"])
  .transform("babelify", { "presets": ["es2015"] })
  .bundle()
  .pipe(source("custom.js"))
  .pipe(buffer());

  return streamqueue({ objectMode: true })
  .queue(libs)
  .queue(isRelease ? custom.pipe(plugins.uglify()) : custom)
  .done();
};

gulp.task("js-dev", function () {
  return jsSrc()
  .pipe(plugins.concat("app.js"))
  .pipe(gulp.dest(genPath + "/js/"));
});

gulp.task("js-release", function () {
  return jsSrc(true)
  .pipe(plugins.concat("app.min.js"))
  .pipe(gulp.dest(genPath + "/js/"));
});

/**
* css tasks
*/
gulp.task("css", function () {
  var libs = gulp.src([
    assetPath + "/libs/bootstrap/css/bootstrap.min.css",
    assetPath + "/libs/font-awesome/css/font-awesome.min.css"
  ]);
  var custom = gulp.src([
    assetPath + "/less/main.less"
  ])
  .pipe(plugins.less())
  .pipe(plugins.autoprefixer())
  .pipe(plugins.cssnano());

  return streamqueue({ objectMode: true }).queue(libs).queue(custom).done()
  .pipe(plugins.concat("app.min.css"))
  .pipe(gulp.dest(genPath + "/css/"));
});

/**
* font tasks
*/
gulp.task("fonts", function () {
  return gulp.src([assetPath + "/libs/font-awesome/fonts/*"])
  .pipe(gulp.dest(genPath + "/fonts/"));
});

/**
* images
*/
gulp.task("images", function () {
  return gulp.src([assetPath + "/imgs/*"])
  .pipe(gulp.dest(genPath + "/imgs/"));
});


/**
* compile all tasks
*/
gulp.task("compile", ["css", "fonts", "images", "js-dev", "js-release"]);

/**
* watch tasks
*/
gulp.task("watch", ["compile"], function () {
  var reload = function (e) {
    setTimeout(function () {
      plugins.livereload.changed(e);
    }, 1000);
  };

  plugins.livereload.listen();
  gulp.watch(assetPath + "/less/**/*.less", ["css"]).on("change", reload);
  gulp.watch(assetPath + "/js/**/*.js", ["js-dev"]).on("change", reload);
  gulp.watch(["src/**/*.html"]).on("change", reload);
});
