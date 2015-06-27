var gulp = require("gulp"),
    plugins = require("gulp-load-plugins")(),
    streamqueue = require("streamqueue");

var assetPath = "src/assets";
var genPath = "./src/assets/gen";

/**
 * javascript tasks
 */
var jsSrc = function (isRelease) {
    var libs = gulp.src([
        assetPath + "/libs/jquery/jquery-1.11.3.min.js",
        assetPath + "/libs/bootstrap/js/bootstrap.min.js"
    ]);

    var custom = gulp.src([
        assetPath + "/js/main.js"
    ]);

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
        assetPath + "/libs/bootstrap/css/bootstrap.min.css"
    ]);
    var custom = gulp.src([
        assetPath + "/css/main.css"
    ])
        .pipe(plugins.autoprefixer())
        .pipe(plugins.minifyCss());

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
 * watch tasks
 */
gulp.task("watch", function () {
    var reload = function (e) {
        setTimeout(function () {
            plugins.livereload.changed(e);
        }, 1000);
    };

    plugins.livereload.listen();
    gulp.watch(assetPath + "/css/**/*.css", ["css"]).on("change", reload);
    gulp.watch(assetPath + "/js/**/*.js", ["js-dev"]).on("change", reload);
    gulp.watch(["src/**/*.html"]).on("change", reload);
});

/**
 * compile all tasks
 */
gulp.task("compile", ["css", "fonts", "js-dev", "js-release"]);