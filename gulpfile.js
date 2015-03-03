// gulpfile.js for sailfish-reload

var gulp = require('gulp'),
	prompt = require('gulp-prompt'),
	util = require('gulp-util'),
	shell = require('gulp-shell'),
	GulpSsh = require('gulp-ssh'),
	fs = require('fs'),
	argv = require('minimist')(process.argv.slice(2));

var ssh;
var config;

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

gulp.task('parse-args', function() {
	var file = argv['reloadfile'];

	if (!file) {
		util.log('No --reloafile specified');
		process.exit(0);
	}
	config = loadConfig(file);
});

gulp.task('watch', function() {
	gulp.watch(config.sync.src, ['sync-files', 'restart-app']);
});

/*
 * Default task for sailfish-reload module.
 * Requires setConfig() to be called in advance
 */
gulp.task('default', ['sshfs-umount', 'sshfs-mount', 'ssh-init', 'watch']);

/*
 * Task used for plain gulp with this file as gulpfile
 * Requires --reloadfile <path> with config to be set
 * (see reloadfile-tmpl.json).
 */
gulp.task('cli-default', ['parse-args', 'default']);

// Export gulp for gulp.start()
exports.gulp = gulp;

// Set configuration used in default task (see reloadfile-tmpl.json)
function setConfig(c) {
  config = c;
}

exports.setConfig =  setConfig;

function loadConfig(loc) {
	var data = false;
	try {
		data = fs.readFileSync(loc, 'utf8');
	} catch (e) {
		if (e instanceof Error) {
			if (e.code !== 'ENOENT') {
				throw e;
			}
		}
	}
	return JSON.parse(data);
}
