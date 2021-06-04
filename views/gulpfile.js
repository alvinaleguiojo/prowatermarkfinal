// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
var less   = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var path = require('path');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('less', function () {
  gulp.src('./assets2/less/main.less')
  	//.pipe(sourcemaps.init())
    .pipe(less())
    
   	.pipe(autoprefixer({
         browsers: ['last 2 versions'],
         cascade: false,
         remove: false,
    }))
    //.pipe(sourcemaps.write())
    .pipe(minifyCSS())
    .pipe(gulp.dest('./assets2/css'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('integrate-less', function () {
    gulp.src('./assets2/less/integrate.less')
        .pipe(less())
        .on('error', function (err) {
            this.emit('end');
        })
        .pipe(autoprefixer({
             browsers: ['last 2 versions'],
             cascade: false,
             remove: false
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./assets2/css'))
        .pipe(browserSync.reload({stream:true}));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src([
        'assets2/js/editor/resources/colors.js',
        'assets2/js/editor/resources/gradients.js',
    	'assets2/js/vendor/jquery.js',
        'assets2/js/vendor/jquery-ui.js',
        'assets2/js/vendor/file-saver.js',
        'assets2/js/vendor/pagination.js',
        'assets2/js/vendor/spectrum.js',
        'assets2/js/vendor/hammer.js',
        'assets2/js/vendor/scrollbar.js',
    	'assets2/js/vendor/angular.min.js',
        'assets2/js/vendor/angular-animate.js',
        'assets2/js/vendor/angular-aria.js',
        'assets2/js/vendor/angular-material.js',
        'assets2/js/vendor/angular-sortable.js',
    	'assets2/js/vendor/fabric.js',
    	'assets2/js/editor/App.js',
        'assets2/js/editor/LocalStorage.js',
        'assets2/js/editor/Settings.js',
        'assets2/js/editor/Keybinds.js',
        'assets2/js/editor/Canvas.js',
        'assets2/js/editor/crop/cropper.js',
        'assets2/js/editor/crop/cropzone.js',
        'assets2/js/editor/crop/cropController.js',
        'assets2/js/editor/basics/RotateController.js',
        'assets2/js/editor/basics/CanvasBackgroundController.js',
        'assets2/js/editor/basics/ResizeController.js',
        'assets2/js/editor/basics/RoundedCornersController.js',
        'assets2/js/editor/zoomController.js',
        'assets2/js/editor/TopPanelController.js',
        'assets2/js/editor/directives/Tabs.js',
        'assets2/js/editor/directives/PrettyScrollbar.js',
        'assets2/js/editor/directives/ColorPicker.js',
        'assets2/js/editor/directives/FileUploader.js',
        'assets2/js/editor/directives/TogglePanelVisibility.js',
        'assets2/js/editor/directives/ToggleSidebar.js',
        'assets2/js/editor/text/Text.js',
        'assets2/js/editor/text/TextController.js',
        'assets2/js/editor/text/TextAlignButtons.js',
        'assets2/js/editor/text/TextDecorationButtons.js',
        'assets2/js/editor/text/Fonts.js',
        'assets2/js/editor/drawing/Drawing.js',
        'assets2/js/editor/drawing/DrawingController.js',
        'assets2/js/editor/drawing/RenderBrushesDirective.js',
        'assets2/js/editor/History.js',
        'assets2/js/editor/Saver.js',
        'assets2/js/editor/filters/FiltersController.js',
        'assets2/js/editor/filters/Filters.js',
        'assets2/js/editor/shapes/SimpleShapesController.js',
        'assets2/js/editor/shapes/StickersController.js',
        'assets2/js/editor/shapes/StickersCategories.js',
        'assets2/js/editor/shapes/SimpleShapes.js',
        'assets2/js/editor/shapes/Polygon.js',
        'assets2/js/editor/objects/ObjectsPanelController.js',
	])
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('assets2/js')) 
    .pipe(browserSync.reload({stream:true}));
});

// Watch Files For Changes
gulp.task('watch', function() {
	browserSync({
        proxy: "pixie.dev"
    });

    gulp.watch('assets2/js/**/*.js', ['scripts']);
    gulp.watch('assets2/less/**/*.less', ['less']);
    gulp.watch('assets2/less/**/integrate.less', ['integrate-less']);
});

// Default Task
gulp.task('default', ['less', 'scripts', 'watch']);