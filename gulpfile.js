// =================================================================
// qml-reload for sailfishOS
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
	fs = require('fs');

var ssh;
var configLoc = './reload.config';
var config;

function createDefaultConfig() {
  return {
  	sshfs: {
  		host: 'localhost',
  		user: 'root',
  		port: '2223',
  		keyfile: '/Applications/sailfish-sdk/vmshare/ssh/private_keys/SailfishOS_Emulator/root'
  	},
  	sync: {
      // files to by synced to dest
  		src: [
  			'/Users/abertschi/beandata/pgm/proj/sailfish-wlan-keyboard/harbour-wlan-keyboard/qml/**/*.*'
  		],
      // location on jolla/ emulaltor
  		dest: '/usr/share/harbour-wlan-keyboard/qml'
  	},
    // dest mount location on your host machine:
  	mount: '/mnt/jolla',
  	sailfish: {
      autoLaunch: true,
      app: 'harbour-wlan-keyboard',
      ssh: {
        host: 'localhost',
        user: 'nemo',
        port: '2223',
        keyfile: '/Applications/sailfish-sdk/vmshare/ssh/private_keys/SailfishOS_Emulator/nemo'
      }
  	}
  };
}

gulp.task('initSsh', function() {
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

gulp.task('sync', function() {
	return gulp.src(config.sync.src)
		.pipe(gulp.dest(config.mount + config.sync.dest));
});

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

gulp.task('exec', ['sync'], function() {
  if (config.sailfish.autoLaunch) {
    ssh.exec(['sailfish-qml ' + config.sailfish.app]);
  }
});

gulp.task('unmountSshfs', function() {
  try {
    return gulp.srch('').pipe(shell('umount ' + config.mount));
  }
  catch(e) {}
});

gulp.task('createSshfs', ['unmountSshfs'], function() {
  try {
    fs.mkdirSync(config.mount);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }

	return gulp.src('').pipe(
    shell('sshfs <%= host %>:/ <%= mntDir %> -p <%= port %> -o IdentityFile=<%= keyfile %>'
      , {
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
	util.log(config.sync);
	gulp.watch(config.sync.src, ['sync', 'exec']);
});

gulp.task('default', ['parseConfig', 'unmountSshfs', 'createSshfs', 'initSsh', 'watch']);

gulp.task('init', function() {
  storeConfig(createDefaultConfig());
  util.log('New config file was created in ' + configLoc +
    '. Edit it before you run this script again.');
    process.exit(1);
});

gulp.task('parseConfig', function() {
	config = loadConfig(configLoc);
	if (!config) {
		util.log('No config file found! Run gulp init first.');
		process.exit(2);
  }

});

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

function storeConfig(loc, config) {
  fs.writeFileSync(configLoc, JSON.stringify(loc, null, 4));
}
