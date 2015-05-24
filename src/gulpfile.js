var gulp = require('gulp'),
    util = require('util'),
    gutil = require('gulp-util');

var Reloadfile = require('./reloadfile').ReloadFile;
var SyncUtil = require('./sync').SyncUtil;
var ExecUtil = require('./exec').ExecUtil;


gulp.task('ssh-init', function () {

    if (Reloadfile.supportsExec()) {
        ExecUtil.initSsh();
    }
});

gulp.task('sync-files', syncFiles);

function syncFiles() {

    var mount = SyncUtil.getClientMountDir();
    var dest = mount + Reloadfile.config.sync.to;

    for (var i = 0; i < Reloadfile.config.sync.from.length; i++) {
        var from = Reloadfile.config.sync.from[i];

        gutil.log(util.format("Syncing files [%s] to [%s]", from, dest));
    }

    return gulp
        .src(Reloadfile.config.sync.from)
        .pipe(gulp.dest(dest));
};

gulp.task('exec', ['sync-files'], function () {

    if (Reloadfile.supportsExec()) {
        gutil.log("Executing commands on target:", Reloadfile.config.run.exec);

        ExecUtil.execWith(Reloadfile.config.run.exec);
    }
});

gulp.task('sshfs-umount', function () {

    if (SyncUtil.isMounted()) {

        var mount = SyncUtil.getClientMountDir();
        gutil.log("Unmounting filesystem from: ", mount);
        SyncUtil.unmountFs();
    }
});

gulp.task('sshfs-mount', ['sshfs-umount'], function () {

    SyncUtil.mountFs();
    var mount = SyncUtil.getClientMountDir();
    gutil.log(util.format("Target successfully mounted to [%s]", mount));

    // sync files initially
    syncFiles();
});

gulp.on('err', function () {
    gutil.beep();
});

gulp.task('watch', function () {
    gulp.watch(Reloadfile.config.sync.from, ['exec']);
});

gulp.task('default', ['sshfs-mount', 'ssh-init', 'watch']);

exports.gulp = gulp;

