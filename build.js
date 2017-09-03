var gulp = require('gulp');
var pandoc = require('gulp-pp-pandoc');
var path = require('path');
const _build = (src, dest, option) =>
    gulp.src(src)
    .pipe(pandoc(option))
    .pipe(gulp.dest(dest));

const _watch = (src, dest, option) =>
    gulp.watch(src, function (stat) {
        if(stat.type !== 'unlink') {
            _build(stat.path, dest, option)
        }
    })
const getOption = (format) => ({
    from: 'markdown',
    to: format,
    ext: `.${format}`,
    args: []
});

module.exports = function ({
    src,
    dist,
    format,
    macro,
    watch
}) {
    const srcPath = typeof src === 'string' ? src : src.fullpath;
    const distPath = typeof dist === 'string' ? dist : dist.fullpath;
    const args = [path.join(srcPath, '*.md'), `${distPath}/`.replace(/\/+$/, '/'), {
        macro,
        from: 'markdown',
        to: format,
        ext: `.${format}`,
        args: []
    }];
    _build(...args);
    if (watch) _watch(...args);
}