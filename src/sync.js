var temp  = require('temp'),
    fs    = require('fs'),
    util  = require('util'),
    path  = require('path'),
    gutil = require('gulp-util'),
    exec  = require('child_process').execSync,
    shell = require('gulp-shell'),
    randomstring = require('randomstring'),
    mkdirp = require('mkdirp');

var Reloadfile = require('./reloadfile').ReloadFile;
var AuthMethods = require('./reloadfile').AuthMethods;

var _clientMountDir = {};

var SyncUtil = {

    mountFs: function() {

        _clientMountDir = _mkDir();

        var config = Reloadfile.config;

        switch (Reloadfile.getAuthModeSync()) {
            case AuthMethods.KEYFILE:

                var user =  config.sync.user;
                var host = config.device.host;
                var port = config.device.port;
                var mount = _clientMountDir;
                var targetMount = "/";
                var keyfile = config.sync.keyfile;

                var cmd = util.format('sshfs -o ssh_command="ssh -p %s -i %s" %s@%s:%s %s', port, keyfile, user, host, targetMount, mount );

                gutil.log("Mounting filesystem with " + cmd);
                exec(cmd);

                break;
            case AuthMethods.USERNAME_PASSWORD:
                
                break;
            case AuthMethods.PUBLIC_KEY:
                break;
            default:
        }
    },

    unmountFs: function() {

        var cmd = "umount <%= mount %>";
        var templateData = {
            mount: _clientMountDir
        };

        shell(cmd, { templateData: templateData, ignoreErrors: true } );
    },

    getClientMountDir: function() {
        return _clientMountDir;
    }
}

exports.SyncUtil = SyncUtil;


function _mkDir() {
    var name = "/tmp/mount/" + randomstring.generate(4);
    return mkdirp.sync(name);
}

