var temp  = require('temp'),
    fs    = require('fs'),
    util  = require('util'),
    path  = require('path'),
    gutil = require('gulp-util'),
    GulpSsh = require('gulp-ssh');


var Reloadfile = require('./reloadfile').ReloadFile;
var AuthMethods = require('./reloadfile').AuthMethods;

var _clientMountDir = {};
var _isAlreadyInit = false;

var ExecUtil = {

    _ssh: null,

    initSsh: function() {

        if (Reloadfile.supportsExec()) {
            var config = Reloadfile.config;

            var sshConfig = {
                host: config.device.host,
                port: config.device.port,
                username: config.run.user
            };

            switch (Reloadfile.getAuthModeRun()) {
                case AuthMethods.KEYFILE:
                    sshConfig.privateKey = fs.readFileSync(config.run.privateKeyFile);
                    break;
                default:
            }

            this._ssh = new GulpSsh({
                ignoreErrors: true,
                sshConfig: sshConfig
            });

            _isAlreadyInit = true;
        }
        return this._ssh;
    },

    execWith: function(cmds) {
        this._ssh.exec(cmds);
    },

    exec: function() {
        this.execWith(Reloadfile.config.run.exec);
    },

    isAlreadyInit: function() {
        return _isAlreadyInit;
    },

    getClientMountDir: function() {
        return _clientMountDir;
    }
}

exports.ExecUtil = ExecUtil;


