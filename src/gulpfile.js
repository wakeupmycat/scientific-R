/*
 * refine on 2017-04-26
 * for tow main task
 *  1. for dev
 *  2. for dist(default is dist)
 * */
var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css'); //instead gulp-mini-css
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');               //- 路径替换
var uglify = require('gulp-uglify'); //压缩js
var htmlmin = require('gulp-htmlmin'); //压缩html
var isDev = false;

//some const
var isDebug = false;
var config = {
    'srcDir': './',
    'destDir': './dist',
    'tmpDir': './tmp',
    'baseDir': {"base": '.'}
}
//清除dist信息
// gulp.task('clean', del.bind(null, ['./tmp', './dist', './rev']));
gulp.task('clean', function () {
    del.sync(['./tmp', './dist', './rev']);
    console.log('=========== begin build ==============');
})

//sass 编译scss
gulp.task('sass', ['clean'], function () {
    return gulp.src('./assets/css/**/*.scss', config.baseDir)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(config.tmpDir));
});

//将temp dir下的资源 压缩 md5 扔到destDir中
gulp.task('css', ['sass'], function () {
    return gulp.src(['./assets/css/**/*.css', './tmp/assets/css/**/*.css', '!./tmp/assets/css/**/Variables.css'])
        .pipe(autoprefixer())
        .pipe(cleanCSS({compatibility: 'ie8', debug: isDebug}, function (details) {
            // console.log(details.name + ': ' + details.stats.originalSize);
            // console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        // .pipe(rename({suffix:'.min'}))
        .pipe(rev({merge: true})) //加md5名
        .pipe(gulp.dest('./dist/assets/css/'))
        .pipe(rev.manifest())                                   //- 生成一个rev-manifest.json
        .pipe(gulp.dest('./rev/css'));                              //- 将 rev-manifest.json 保存到 rev 目录内
})
//replace css
gulp.task('rev-css', ['css'], function () {
    return gulp.src(['./rev/css/*.json', './html/*.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector({replaceReved: true}))                                   //- 执行文件内css名的替换
        // .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./tmp/html'));                     //- 替换后的文件输出的目录
});

//copy resource
gulp.task('copy-res', function () {
    return gulp.src(['./assets/fonts/*.*', './assets/imgs/*.*', './assets/tpl/*.*','./temp/**/*.*'], config.baseDir)
        .pipe(gulp.dest('./dist/'))
})

//minify select2.css use one times
gulp.task('compress', function () {
    gulp.src(['./assets/js/libs/select2/*.css'])
        .pipe(autoprefixer())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./assets/js/libs/select2/'))
})

//mini libs js
gulp.task('script-lib', function () {
    // gulp.src(['./assets/js/libs/**/*.js', '!./assets/js/libs/**/*.min.js'], config.baseDir)
    //     .pipe(uglify())
    //     .pipe(rename({suffix: '.min'}))
    //     .pipe(gulp.dest('./'));
    return gulp.src(['./assets/js/libs/**/*.min.js', './assets/js/libs/**/*.min.css', './assets/js/libs/**/*.png', './assets/js/libs/**/*.gif'], config.baseDir)
        .pipe(gulp.dest('./dist/'))

})
//minify biz js md5 and replace html src
gulp.task('script-biz', function () {
    gulp.src(['./assets/js/biz/**/*.js'], config.baseDir)
        .pipe(uglify({ //fuck you ie
            compress: { screw_ie8: false },
            mangle: { screw_ie8: false },
            output: { screw_ie8: false }
        }))
        .pipe(rev({merge: true})) //加md5名
        .pipe(gulp.dest('./dist/'))
        .pipe(rev.manifest({
            merge: true
        }))                                   //- 生成一个rev-manifest.json
        .pipe(gulp.dest('./rev/js/'));                              //- 将 rev-manifest.json 保存到 rev 目录内
})

//replace biz js from tmp
//['rev-css','copy-res','script-lib','script-biz']
gulp.task('rev-js', ['rev-css', 'copy-res', 'script-lib', 'script-biz'], function () {
    return gulp.src(['./rev/js/*.json', './tmp/html/*.html'])   //- 读取 rev-manifest.json 文件以及需要进行js名替换的文件
        .pipe(revCollector({replaceReved: true}))                                   //- 执行文件内js名的替换
        .pipe(htmlmin({
            removeComments: true,//清除HTML注释
            collapseWhitespace: true,//压缩HTML
        }))
        .pipe(gulp.dest('./dist/'))                     //- 替换后的文件输出的目录
    // .pipe(del.sync(['./rev','./tmp']))

});

gulp.task('dist', ['rev-js'], function () {
    console.log('=========== finished build ==============');
    del(['./tmp', './rev'])
})

gulp.task('default', ['dist']);

//for developer
gulp.task('dev', ['default'], function () {
    isDev = true;
    gulp.watch(['./assets/**/*.js', './assets/**/*.css', './assets/**/*.scss'], ['rev-js'])
})
