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

    var files = Reloadfile.config.sync.files;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var dest = mount + file.to;

        for (var j = 0; j < file.from.length; j++) {
            var from = file.from[j];

            gutil.log(util.format("Syncing files [%s] to [%s]", from, dest));
        }

        var _ = gulp.src(file.from)
            .pipe(gulp.dest(dest));
    }
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
    var files = Reloadfile.config.sync.files;

    for(var i = 0; i < files.length; i ++) {
        gulp.watch(files[i].from, ['exec']);
    }
});

gulp.task('default', ['sshfs-mount', 'ssh-init', 'watch']);

exports.gulp = gulp;

