var gulp = require('gulp');
var util = require('gulp-util');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var browserify = require('gulp-browserify');
var compass = require('gulp-compass');
var connect = require('gulp-connect');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var minifyHTML = require('gulp-minify-html');
var jsonminify = require('gulp-jsonminify');
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');

var env = process.env.NODE_ENV || 'development';

var outputDir,sassStyle;
if (env === 'development'){
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
}else{
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
}

console.log(outputDir);

var coffeeSources = ['components/coffee/tagline.coffee'];
var jsSources =[
    'components/scripts/rclick.js',
    'components/scripts/pixgrid.js',
    'components/scripts/tagline.js',
    'components/scripts/template.js'
];
var sassSources= ['components/sass/style.scss'];
var htmlSources=[outputDir+'*.html'];
var jsonSources=[outputDir+'js/*.json'];

gulp.task('coffee',function(){
    gulp.src(coffeeSources)
        .pipe(coffee({bare:true}).on('error',util.log))
        .pipe(gulp.dest('components/scripts'))
})

gulp.task('js',function(){
    gulp.src(jsSources)
        .pipe(concat('script.js'))
        .pipe(browserify())
        .pipe(uglify(env==='production',uglify()))
        .pipe(gulp.dest(outputDir+'js'))
        .pipe(connect.reload())
})

gulp.task('compass',function(){
    gulp.src(sassSources)
        .pipe(compass({
            sass:'components/sass',
            image:outputDir+'images',
            style:sassStyle
        }).on('error',util.log))
        .pipe(gulp.dest(outputDir+'css'))
        .pipe(connect.reload())
})

gulp.task('watch',function(){
    gulp.watch(coffeeSources,['coffee']);
    gulp.watch(jsSources,['js']);
    gulp.watch('components/sass/*.scss',['compass']);
    gulp.watch('builds/development/*.html',['html']);
    gulp.watch('builds/development/js/*.json',['json']);
    gulp.watch('builds/development/images/**/*.*',['images']);
})

gulp.task('html',function(){
    gulp.src('builds/development/*.html')
        .pipe(gulpif(env==='production',minifyHTML()))
        .pipe(gulpif(env==='production',gulp.dest(outputDir)))
        .pipe(connect.reload())
})

gulp.task('images',function(){
    gulp.src('builds/development/images/**/*.*')
        .pipe(gulpif(env==='production',imagemin({
            progressive:true,
            svgoPlugins:[{removeViewBox:false}],
            use:[pngcrush()]
        })))
        .pipe(gulpif(env==='production',gulp.dest(outputDir+'images')))
        .pipe(connect.reload())
})

gulp.task('json',function(){
    gulp.src('builds/development/js/*.json')
        .pipe(gulpif(env==='production',jsonminify()))
        .pipe(gulpif(env==='production',gulp.dest('builds/production/js')))
        .pipe(connect.reload())
})

gulp.task('connect',function(){
    connect.server({
        port:3000,
        root:outputDir,
        livereload:true
    });
})

gulp.task('default',['html','json','coffee','js','compass','images','connect','watch']);