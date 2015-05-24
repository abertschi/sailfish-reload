var fs = require('fs');
var keyMirror = require('keymirror');

var AuthMethods = keyMirror({
    KEYFILE: null,
    PUBLIC_KEY: null
});

exports.AuthMethods = AuthMethods;

var ReloadFile = {

    verbose: false,

    config: {
        device: {
            host: "",
            port: "",
        },
        sync: {
            user: "",
            privateKeyFile: "",
            files: [
                {
                    from: [],
                    to: ""
                }
            ]
        },
        run: {
            user: "",
            privateKeyFile: "",
            exec: []
        }
    },


    createTemplate: function (location) {
        fs.writeFileSync(location, JSON.stringify(this.config, null, 4));
    },

    load: function (location) {
        this.config = require(location);
        this.validate();
        return this.config;
    },

    validate: function () {

    },

    supportsExec: function () {
        var result = false;

        if (this.config.run &&
            this.config.run.exec &&
            this.config.run.exec.length > 0) {
            result = true;
        }
        return result;
    },

    getAuthModeSync: function () {
        var result;
        if (this.config.sync.privateKeyFile &&
            this.config.sync.privateKeyFile != "") {
            result = AuthMethods.KEYFILE;

        } else {
            result = AuthMethods.PUBLIC_KEY;
        }

        return result;
    },

    getAuthModeRun: function () {
        var result;

        if (this.getAuthModeSync()) {
            if (this.config.run.privateKeyFile &&
                this.config.run.privateKeyFile != "") {
                result = AuthMethods.KEYFILE;

            } else {
                result = AuthMethods.PUBLIC_KEY;
            }
        }
        return result;
    }
}

exports.ReloadFile = ReloadFile;