'use strict';

/** VARIABLES **/
var gulp = require('gulp');

var coffee = require('gulp-coffee'),
    coffeelint = require('gulp-coffeelint'),
    concatcss = require('gulp-concat-css'),
    gutil = require('gulp-util'),
    jade = require('gulp-jade'),
    jshint = require('gulp-jshint'),
    minifycss = require('gulp-minify-css'),
    mochaPhantomJS = require('gulp-mocha-phantomjs'),
    rename = require('gulp-rename'),
    rimraf = require('gulp-rimraf'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber');

// Input File Paths
var source = 'source';

var cssSource = source + 'scss/*.scss',
    externalSource = source + 'external',
    htmlSource = source + '/jade/*.jade',
    jsSource = source + 'coffee/**/*.coffee',
    templateSource = source + 'jade/templates/**/*.jade';

var externalCssSource = externalSource + '/css/*.css',
    externalImageSource = externalSource + '/js/*.js',
    externalJsSource = externalSource + '/image/*.*',
    externalLibrarySource = externalSource + '/bower_components/**/*';

// Output File Paths
var output = 'output';

var cssOutput = output + 'css/',
    jsOutput = output + 'js/',
    imageOutput = output + '/images/';

var templateOutput = jsOutput + 'templates/',
    libraryOutput = jsOutput + 'bower_components';

// Test File Paths
var testSource = 'test/**/*.spec.js',
    testRunner = 'test/runner.html';

/** TASKS **/

// Default task
gulp.task('default', ['copyExternals', 'compileTemplates', 'compileSass', 'compileCoffee', 'compileJade', 'test', 'watch']);

//CSS - will compile and minify scss
gulp.task('compileSass', function() {
    return gulp.src(['src/scss/reset.scss', 'src/scss/extraExternal.scss', cssSource])
        .pipe(sass({
            errLogToConsole: true,
            force: true,
            includePaths: ['src/sass/']
        }))
        .pipe(gulp.dest(cssOutput))
        .pipe(concatcss('all.css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('css/'));
});

// Scripts -compile will compile and minify scripts
gulp.task('compileCoffee', function() {
    return gulp.src(jsSource)
        .pipe(coffeelint({
            'indentation': {
                'value': 4,
                'level': 'warn'
            },
            'max_line_length': {
                'level': 'ignore'
            },
            'no_unnecessary_double_quotes': {
                'level': 'warn'
            },
            'no_debugger': {
                'level': 'ignore'
            }
        }))
        .pipe(coffeelint.reporter())
        .pipe(plumber())
        .pipe(coffee())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest(jsOutput));
});

// Compile jade into html
gulp.task('compileJade', function() {
    gulp.src(htmlSource)
        .pipe(plumber())
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(''));
});

// Compile all the jade templates into html
gulp.task('compileTemplates', function() {
    return gulp.src(templateSource)
        .pipe(plumber())
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(templateOutput));
});

// Copy over files from source to output
gulp.task('copyExternals', ['copyExternalCSS', 'copyExternalLibraries', 'copyExternalImages', 'copyExternalJavascript']);

gulp.task('copyExternalCSS', function() {
    return gulp.src(externalCssSource)
        .pipe(concatcss('allExternal.css'))
        .pipe(gulp.dest(cssOutput))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest(cssOutput));
});

gulp.task('copyExternalImages', function() {
    return gulp.src(externalImageSource)
        .pipe(gulp.dest(imageOutput));
});


gulp.task('copyExternalLibraries', function() {
    return gulp.src(externalLibrarySource)
        .pipe(gulp.dest(libraryOutput));
});

gulp.task('copyExternalJavascript', function() {
    return gulp.src(externalJsSource)
        .pipe(gulp.dest(jsOutput));
});

// Clean - Removes all scripts and css inside folder
gulp.task('clean', function() {
    return gulp.src([cssOutput, jsOutput], {
            read: false
        })
        .pipe(rimraf({
            force: true
        }));
});

gulp.task('test', function() {
    return gulp
        .src(testRunner)
        .pipe(mochaPhantomJS());
});

// Watch - watch .js, .scss, and .jade files
gulp.task('watch', function() {
    gulp.watch(cssSource, ['compileSass']);
    gulp.watch(jsSource, ['compileCoffee']);
    gulp.watch(htmlSource, ['compileJade']);
    gulp.watch(templateSource, ['compileTemplates']);
    gulp.watch(testSource, ['test']);
    gulp.watch('src/external/**/*', ['copyExternals']);
});