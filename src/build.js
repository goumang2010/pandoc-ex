var gulp = require('gulp');
var pandoc = require('gulp-pdc');
var fs = require('fs');
var path = require('path');
var extMap = require('./ext-map');
const getExt = (format) => (extMap[format] || format);

const _build = via => via ?
    (src, dest, option) =>
        gulp.src(src)
            .pipe(pandoc(Object.assign({}, option, { to: via })))
            .pipe(pandoc(Object.assign({}, option, { from: via })))
            .pipe(gulp.dest(dest))
    :
    (src, dest, option) =>
        gulp.src(src)
            .pipe(pandoc(option))
            .pipe(gulp.dest(dest));

const _watch = build => (src, dest, option, srcPath, distPath) => {
    const watcher = gulp.watch(src, {cwd: process.cwd()});
    watcher.on('change', function(path, stats) {
        build(path, dest, option)
      });
    watcher.on('add', function(path, stats) {
        build(path, dest, option)
    });
    watcher.on('unlink', function(p, stats) {
        const target = path.resolve(process.cwd(), p).replace(srcPath, distPath).replace(getExt(option.from), getExt(option.to));
        fs.unlink(target, (err) => {
            if(err) {
                console.log(err);
            }
        });
    });
}

module.exports = function ({
    src,
    dist,
    from,
    to,
    macro,
    watch,
    via,
    other
}) {
    const srcPath = typeof src === 'string' ? src : src.fullpath;
    const distPath = typeof dist === 'string' ? dist : dist.fullpath;
    const args = [path.join(srcPath, '*.md'), `${distPath}/`.replace(/\/+$/, '/'), {
        macro,
        from,
        to: to,
        ext: `.${to}`,
        args: Object.keys(other).map((key) => `--${key}=${other[key]}`)
    }];
    const build = _build(via);
    build(...args);
    if (watch) _watch(build)(...args, srcPath, distPath);
}