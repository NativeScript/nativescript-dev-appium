#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var portastic = require('portastic');
var child_process = require('child_process');

var args = process.argv.map(function(i){return i.trim(); });
var verbose = args.find(function(value) {
    return value === '-v' || value === '--verbose';
}) !== undefined;

var testRunType = 'android';
if (args.find(function(arg) { return arg.trim() === 'ios'; })) {
    testRunType = 'ios';
} else if (args.find(function(arg) { return arg.trim() === 'ios-simulator'; })) {
    testRunType = 'ios-simulator';
}

function log(message) {
    if (verbose) {
        console.log(message);
    }
}

function logOut(line, force) {
    if (verbose || force) {
        process.stdout.write(line);
    }
}

function logErr(line, force) {
    if (verbose || force) {
        process.stderr.write(line);
    }
}

var appium = 'appium';
if (process.platform === 'win32') {
    appium = 'appium.cmd';
}

var projectDir = path.dirname(path.dirname(__dirname));
var pluginAppiumBinary = path.join(__dirname, 'node_modules', '.bin', appium);
var projectAppiumBinary = path.join(projectDir, 'node_modules', '.bin', appium);
var appiumBinary = projectAppiumBinary;
if (fs.existsSync(pluginAppiumBinary)) {
    appiumBinary = pluginAppiumBinary;
}
log('Appium found at: ' + appiumBinary);

var pluginCucumberBinary = path.join(__dirname, 'node_modules', '.bin', 'cucumberjs');
var projectCucumberBinary = path.join(projectDir, 'node_modules', '.bin', 'cucumberjs');
var cucumberBinary = projectCucumberBinary;
if (fs.existsSync(pluginCucumberBinary)) {
    cucumberBinary = pluginCucumberBinary;
}
log('Cucumber found at: ' + cucumberBinary);

portastic.find({min: 9000, max: 9100}).then(function(ports) {
    var port = ports[0];
    var server = child_process.spawn(appiumBinary, ['-p', port]);

    server.stdout.on('data', function (data) {
        logOut('' + data);
    });
    server.stderr.on('data', function (data) {
        logErr('' + data);
    });
    server.on('exit', function (code) {
        logOut('Server process exited with code ' + code);
    });

    waitForOutput(server, /listener started/, 15000).then(function() {
        process.env.APPIUM_PORT = port;
        var tests = child_process.spawn(cucumberBinary, [], {shell: true, env: getTestEnv()});
        tests.stdout.on('data', function (data) {
            logOut('' + data, true);
        });
        tests.stderr.on('data', function (data) {
            logErr('' + data, true);
        });
        tests.on('exit', function (code) {
            console.log('Test runner exited with code ' + code);
            server.kill();
            process.exit(code);
        });
    }, function(err) {
        console.log('Test runner could not start: ' + err);
        server.kill();
        process.exit(1);
    });
});

function getTestEnv() {
    var testEnv = JSON.parse(JSON.stringify(process.env));
    testEnv.TEST_RUN_TYPE = testRunType;
    if (verbose) {
        testEnv.VERBOSE_LOG = 'true';
    }
    return testEnv;
}

function waitForOutput(process, matcher, timeout) {
    return new Promise(function(resolve, reject) {
        var abortWatch = setTimeout(function() {
            process.kill();
            console.log('Timeout expired, output not detected for: ' + matcher);
            reject(new Error('Timeout expired, output not detected for: ' + matcher));
        }, timeout);

        process.stdout.on('data', function (data) {
            var line = '' + data;
            if (matcher.test(line)) {
                clearTimeout(abortWatch);
                resolve();
            }
        });
    });
}
