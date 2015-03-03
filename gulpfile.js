// =================================================================
// sailfsh-reload
//   > Auto synces source changes to Jolla or Emulator
//   > and restarts app if desired.
//
// Requirements:
//   - node.js - http://nodejs.org/download/
//   - gulp - npm install gulp -g
//   - sshfs - http://fuse.sourceforge.net/sshfs.html
//
// Usage:
//   1) Create config file by running:
//     $ gulp init
//   2) Adapt config file
//   3) Start script again by running gulp (default task):
//     $ gulp
//
//
// MIT license, Andrin Bertschi
//
// =================================================================/

var gulp = require('gulp'),
	prompt = require('gulp-prompt'),
	util = require('gulp-util'),
	shell = require('gulp-shell'),
	GulpSsh = require('gulp-ssh'),
	fs = require('fs'),
	argv = require('minimist')(process.argv.slice(2));

var ssh;
var config;

exports.gulp = gulp;

function setConfig(c) {
  config = c;
}
exports.setConfig =  setConfig;

gulp.task('ssh-init', function() {

	var sf = config.sailfish;
	if (sf.autoLaunch) {
		ssh = new GulpSsh({
			ignoreErrors: false,
			sshConfig: {
				host: sf.ssh.host,
				port: sf.ssh.port,
				username: sf.ssh.user,
				privateKey: require('fs').readFileSync(sf.ssh.keyfile)
			}
		});
	}
});

gulp.task('sync-files', function() {
	var dest = config.mount + config.sync.dest;
	util.log('syncing files to ' + dest);

	return gulp.src(config.sync.src)
		.pipe(gulp.dest(dest));
});

gulp.task('restart-app', ['sync-files'], function() {
	util.log('restarting ', config.sailfish.app);

	if (config.sailfish.autoLaunch) {
		ssh.exec(['sailfish-qml ' + config.sailfish.app]);
	}
});

gulp.task('sshfs-umount', function() {
	util.log('unmounting', config.mount);

	try {
		return gulp.srch('').pipe(shell('umount ' + config.mount));
	} catch (e) {}
});

gulp.task('sshfs-mount', ['sshfs-umount'], function() {
	util.log('mounting device to', config.mount);

	try {
		fs.mkdirSync(config.mount);
	} catch (e) {
		if (e.code != 'EEXIST') throw e;
	}

	return gulp.src('').pipe(
		shell(
			'sshfs <%= host %>:/ <%= mntDir %> -p <%= port %> -o IdentityFile=<%= keyfile %>', {
				templateData: {
					host: config.sshfs.user + '@' + config.sshfs.host,
					mntDir: config.mount,
					port: config.sshfs.port,
					keyfile: config.sshfs.keyfile
				}
			})
	);
});

gulp.task('watch', function() {
	gulp.watch(config.sync.src, ['sync-files', 'restart-app']);
});

gulp.task('default', ['sshfs-umount', 'sshfs-mount', 'ssh-init', 'watch']);
