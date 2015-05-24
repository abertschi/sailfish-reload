var prettyTime          = require('pretty-hrtime');
var gutil               = require('gulp-util');
var chalk               = require('chalk');

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

exports.logEvents = logEvents;

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

exports.formatError= formatError;