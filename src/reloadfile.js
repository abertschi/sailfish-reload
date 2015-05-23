var fs = require('fs');
var keyMirror = require('keymirror');

var AuthMethods = keyMirror({
    USERNAME_PASSWORD: null,
    KEYFILE: null,
    PUBLIC_KEY: null
});

exports.AuthMethods = AuthMethods;

var ReloadFile = {

    config: {
        device: {
            host: "",
            port: "",
        },
        sync: {
            user: "",
            password: "",
            keyfile: "",
            from: [],
            to: ""
        },
        run: {
            user: "",
            password: "",
            keyfile: "",
            exec: []
        }
    },

    createTemplate: function (location) {
        fs.writeFileSync(location, JSON.stringify(this.config, null, 4));
    },

    load: function (location) {
        config = require(location);
        this.validate();
        return config;
    },

    validate: function () {

    },

    supportsRun: function () {
        var result = false;

        if (this.config.run &&
            this.config.run.exec &&
            this.config.run.exec.size > 0) {
            result = true;
        }
        return result;
    },

    getAuthModeSync: function () {
        var result;
        if (this.config.sync.keyfile &&
            this.config.sync.keyfile != "") {
            result = AuthMethods.KEYFILE;

        } else if (this.config.sync.password != 'undefined') {
            result = AuthMethods.USERNAME_PASSWORD;

        } else {
            result = AuthMethods.PUBLIC_KEY;
        }

        return result;
    },

    getAuthModeRun: function () {
        var result;

        if (this.supportsRun()) {
            if (this.config.run.keyfile &&
                this.config.run.keyfile != "") {
                result = AuthMethods.KEYFILE;

            } else if (this.config.run.password != 'undefined') {
                result = AuthMethods.USERNAME_PASSWORD;

            } else {
                result = AuthMethods.PUBLIC_KEY;
            }
        }
        return result;
    }
}

exports.ReloadFile = ReloadFile;