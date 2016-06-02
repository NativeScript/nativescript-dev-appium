#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var portastic = require("portastic");
var child_process = require("child_process");

var args = process.argv.map(function(i){return i.trim(); });
var verbose = args.find(function(value) {
    return value === "-v" || value === "--verbose";
}) !== undefined;

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

var appium = "appium";
if (process.platform === "win32") {
    appium = "appium.cmd";
}

var projectDir = path.dirname(path.dirname(__dirname));
var pluginAppiumBinary = path.join(__dirname, "node_modules", ".bin", appium);
var projectAppiumBinary = path.join(projectDir, "node_modules", ".bin", appium);
var appiumBinary = projectAppiumBinary;
if (fs.existsSync(pluginAppiumBinary)) {
    appiumBinary = pluginAppiumBinary;
}
log("Appium found at: " + appiumBinary);

var pluginMochaBinary = path.join(__dirname, "node_modules", ".bin", "mocha");
var projectMochaBinary = path.join(projectDir, "node_modules", ".bin", "mocha");
var mochaBinary = projectMochaBinary;
if (fs.existsSync(pluginMochaBinary)) {
    mochaBinary = pluginMochaBinary;
}
log("Mocha found at: " + mochaBinary);

mochaOpts = [
    "--recursive",
    "e2e-tests"
];

portastic.find({min: 9000, max: 9100}).then(function(ports) {
    var port = ports[0];
    var server = child_process.spawn(appiumBinary, ["-p", port]);

    server.stdout.on('data', function (data) {
        logOut("" + data);
    });
    server.stderr.on('data', function (data) {
        logErr("" + data);
    });
    server.on('exit', function (code) {
        logOut('Server process exited with code ' + code);
    });

    waitForOutput(server, /listener started/, 5000).then(function() {
        process.env.APPIUM_PORT = port;
        var childEnv = JSON.parse(JSON.stringify(process.env));
        if (verbose) {
            childEnv.VERBOSE_LOG = "true";
        }
        var tests = child_process.spawn(mochaBinary, mochaOpts, {shell: true, env: childEnv});
        tests.stdout.on('data', function (data) {
            logOut("" + data, true);
        });
        tests.stderr.on('data', function (data) {
            logErr("" + data, true);
        });
        tests.on('exit', function (code) {
            console.log('Test runner exited with code ' + code);
            server.kill();
        });
    });
});

function waitForOutput(process, matcher, timeout) {
    return new Promise(function(resolve, reject) {
        var abortWatch = setTimeout(function() {
            process.kill();
            console.log("Timeout expired, output not detected for: " + matcher);
            reject(new Error("Timeout expired, output not detected for: " + matcher));
        }, timeout);

        process.stdout.on('data', function (data) {
            var line = "" + data;
            if (matcher.test(line)) {
                clearTimeout(abortWatch);
                resolve();
            }
        });
    });
}
