var gulp = require('gulp'),
    gutil = require('gulp-util'),
    shell = require('gulp-shell'),
    GulpSsh = require('gulp-ssh'),
    fs = require('fs'),
    argv = require('minimist')(process.argv.slice(2));


var reloadfile = require('./reloadfile').ReloadFile;
var AuthMethods = require('./reloadfile').AuthMethods;
var SyncUtil = require('./sync').SyncUtil;

var ssh;

gulp.task('ssh-init', function () {

    if (reloadfile.supportsRun()) {
        var config = reloadfile.config;

        var sshConfig = {
            host: config.device.host,
            port: config.device.port,
            username: config.run.user
        };

        switch (reloadfile.getAuthModeRun()) {
            case AuthMethods.KEYFILE:
                sshConfig.privateKey = config.run.keyfile;
                break;
            case AuthMethods.USERNAME_PASSWORD:
                sshConfig.password = config.run.password;
                break;
            case AuthMethods.PUBLIC_KEY:
                break;
            default:
        }

        ssh = new GulpSsh({
            ignoreErrors: false,
            sshConfig: sshConfig
        });
    }
});

gulp.task('sync-files', function () {
    var dest = config.mount + config.sync.dest;
    gutil.log('syncing files to ' + dest);

    return gulp.src(config.sync.src)
        .pipe(gulp.dest(dest));
});

gulp.task('exec', ['sync-files'], function () {
    gutil.log('start ', config.sailfish.app);

    if (config.sailfish.autoLaunch) {
        ssh.exec(['pkill sailfish-qml', {ignoreErrors: true},
            'sailfish-qml ' + config.sailfish.app]);
    }
});

gulp.task('sshfs-umount', function () {

    var mount = SyncUtil.getClientMountDir();
    SyncUtil.unmountFs();

    gutil.log('Unmounting target ', mount);

});

gulp.task('sshfs-mount', ['sshfs-umount'], function () {

    SyncUtil.mountFs();
    var mount = SyncUtil.getClientMountDir();
    gutil.log("Target successfully mounted to ", mount);

});

gulp.on('err', function () {
    gutil.beep();
});

gulp.task('watch', function () {
    gulp.watch(config.sync.src, ['exec']);
});

gulp.task('default', ['sshfs-mount', 'ssh-init', 'watch']);

exports.gulp = gulp;

