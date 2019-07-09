const gulp = require('gulp');
const less = require('gulp-less'); // 编译less
const autoprefixer = require('gulp-autoprefixer'); // 兼容浏览器
const browserify = require('browserify'); // 模块化打包
const stream = require('vinyl-source-stream'); // 转成gulp的stream流
const buffer = require('vinyl-buffer'); // 二进制流
const uglify = require('gulp-uglify'); // 压缩Js
const babel = require('gulp-babel');
const clean = require('gulp-clean'); // 清除文件
const rename = require('gulp-rename'); // 文件重命名
const minifyCss = require('gulp-minify-css'); // 压缩css
const path = require('path');

const fileConf = {
    fileName: 'CustomSwiper',
    srcJs: path.join(__dirname, './src/*.js'),
    srcLess: path.join(__dirname, './src/*.less'),
    dist: path.join(__dirname, './dist')
};

gulp.task('clean', function () {
    return gulp.src(fileConf.dist + '/*').pipe(clean());
});

gulp.task('js', function () {
    return gulp
        .src(fileConf.srcJs)
        .pipe(
            babel({
                presets: ['@babel/env'],
                plugins: [
                    '@babel/proposal-class-properties',
                    'transform-es2015-modules-umd'
                ]
            })
        )
        .pipe(gulp.dest(fileConf.dist));
});

gulp.task('browserify', function () {
    return browserify({
        entries: 'dist/CustomSwiper.js'
    })
        .bundle()
        .pipe(stream('CustomSwiper.js'))
        .pipe(gulp.dest(fileConf.dist))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(
            rename(filePath => {
                filePath.basename += '.min';
            })
        )
        .pipe(gulp.dest(fileConf.dist));
});

gulp.task('clean-util', function () {
    return gulp.src(fileConf.dist + '/util.js').pipe(clean());
});

gulp.task('less', function () {
    return gulp
        .src(fileConf.srcLess)
        .pipe(less())
        .pipe(
            autoprefixer({
                browsers: ['last 2 versions', 'Android >= 4.0'],
                cascade: false // 是否美化属性值
            })
        )
        .pipe(gulp.dest(fileConf.dist))
        .pipe(minifyCss())
        .pipe(
            rename(filePath => {
                filePath.basename += '.min';
            })
        )
        .pipe(gulp.dest(fileConf.dist));
});

gulp.task(
    'default',
    gulp.series('clean', 'js', 'browserify', 'clean-util', 'less')
);
