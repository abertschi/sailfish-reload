'use strict';

require('shelljs/global');

var reloadfile          = require('../ReloadFile').ReloadFile;

var prettyTime          = require('pretty-hrtime');
var gulp                = require('gulp');
var gutil               = require('gulp-util');
var Liftoff             = require('liftoff');
var interpret           = require('interpret');
var v8flags             = require('v8flags');
var argv                = require('minimist')(process.argv.slice(2));
var fs                  = require('fs');
var chalk               = require('chalk');

var liftoff = new Liftoff({
    name: 'sailfish-reload',
    configName: 'reloadfile'
});

liftoff.launch({
    cwd: argv.cwd,
    configPath: argv.reloadfile,
    verbose: argv.verbose
}, invoke);

function invoke(env) {

    if (argv.verbose) {
        gutil.log('LIFTOFF SETTINGS:', this);
        gutil.log('CLI OPTIONS:', argv);
        gutil.log('CWD:', env.cwd);
        gutil.log('LOCAL MODULES PRELOADED:', env.require);
        gutil.log('SEARCHING FOR:', env.configNameRegex);
        gutil.log('FOUND CONFIG AT:', env.configPath);
        gutil.log('CONFIG BASE DIR:', env.configBase);
        gutil.log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
        gutil.log('LOCAL PACKAGE.JSON:', env.modulePackage);
        gutil.log('CLI PACKAGE.JSON', require('../package'));
    }

    if (!which('sshfs')) {
        gutil.log('Sorry, sshfs was not found.');
        exit(1);
    }

    if (!which('ssh')) {
        gutil.log('Sorry, ssh was not found.');
        exit(1);
    }

    if (process.cwd() !== env.cwd) {
        process.chdir(env.cwd);
        gutil.log('Working directory changed to', env.cwd);
    }

    if (!env.modulePath) {
        gutil.log('sailfish-reload not found in:', env.cwd);
        // process.exit(1);
    }

    console.log( env);
    var configfile = env.configPath;

    if (true) { //argv['create-reloadfile']
        reloadfile.createTemplate(configfile);
        gutil.log('reloadfile.json created at ' + configfile);
        process.exit(1);
    }

    var config;
    try {
        config = require(configfile);
    } catch (e) {
    }

    if (!config) {
        gutil.log('No configfile found in ', configfile);
        process.exit(1);
    }

    var sfReload = require('../gulpfile.js');
    logEvents(sfReload.gulp);
    sfReload.setConfig(config);
    sfReload.gulp.start('default');
}

function storeConfig(loc, config) {
    fs.writeFileSync(loc, JSON.stringify(config, null, 4));
}

/*
 * config gulp logging:
 * source copied from cli script of gulp.js
 */

// wire up logging events
function logEvents(gulpInst) {
    gulpInst.on('task_start', function (e) {
        gutil.log('starting', '\'' + chalk.cyan(e.task) + '\'...');
    });

    gulpInst.on('task_stop', function (e) {
        var time = prettyTime(e.hrDuration);
        gutil.log('finished', '\'' + chalk.cyan(e.task) + '\'', 'after', chalk.magenta(time)
        );
    });

    gulpInst.on('task_err', function (e) {
        var msg = formatError(e);
        var time = prettyTime(e.hrDuration);
        gutil.log('\'' + chalk.cyan(e.task) + '\'', chalk.red('errored after'),
            chalk.magenta(time));
        gutil.log(msg);
    });

    gulpInst.on('task_not_found', function (err) {
        gutil.log(
            chalk.red('Task \'' + err.task + '\' is not in your gulpfile')
        );
        gutil.log('Please check the documentation for proper gulpfile formatting');
        process.exit(1);
    });
}

function formatError(e) {
    if (!e.err) {
        return e.message;
    }

    // PluginError
    if (typeof e.err.showStack === 'boolean') {
        return e.err.toString();
    }

    // normal error
    if (e.err.stack) {
        return e.err.stack;
    }

    // unknown (string, number, etc.)
    return new Error(String(e.err)).stack;
}