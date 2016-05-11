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

var projectDir = path.dirname(path.dirname(__dirname));
var pluginAppiumBinary = path.join(__dirname, "node_modules", ".bin", "appium");
var projectAppiumBinary = path.join(projectDir, "node_modules", ".bin", "appium");
var appiumBinary = projectAppiumBinary;
if (fs.existsSync(pluginAppiumBinary)) {
    appiumBinary = pluginAppiumBinary;
}
if (verbose) {
log("Appium found at: " + appiumBinary);
}

var pluginMochaBinary = path.join(__dirname, "node_modules", ".bin", "mocha");
var projectMochaBinary = path.join(projectDir, "node_modules", ".bin", "mocha");
var mochaBinary = projectMochaBinary;
if (fs.existsSync(pluginMochaBinary)) {
    mochaBinary = pluginMochaBinary;
}
log("Mocha found at: " + mochaBinary);

var mochaOptsVar = process.env.MOCHA_OPS || "";
mochaOpts = mochaOptsVar.split(/\s+/).filter(function(item){
    return item.length > 0;
});
mochaOpts = mochaOpts.concat([
    "--recursive",
    "e2e-tests"
]);

portastic.find({min: 9000, max: 9100}).then(function(ports) {
    var port = ports[0];
    var server = child_process.spawn(appiumBinary, ["-p", port]);

    server.stdout.on('data', function (data) {
        if (verbose) {
            console.log('APPIUM> ' + data);
        }
    });
    server.stderr.on('data', function (data) {
        if (verbose) {
            console.log('APPIUM> ' + data);
        }
    });
    server.on('exit', function (code) {
        console.log('Server process exited with code ' + code);
    });

    waitForPort(port, 5000).then(function() {
        process.env.APPIUM_PORT = port;
    var tests = child_process.spawn(mochaBinary, mochaOpts, {shell: true});
        tests.stdout.on('data', function (data) {
            console.log("" + data);
        });
        tests.stderr.on('data', function (data) {
            console.log("" + data);
        });
        tests.on('exit', function (code) {
            console.log('Test runner exited with code ' + code);
            server.kill();
        });
    });
});

function waitForPort(port, timeout) {
    console.log("Waiting for server to start listening on port: " + port);
    return new Promise(function(resolve, reject) {
        var interval = 200;
        var started = false;
        var time = 0;
        setTimeout(check, interval);

        function check() {
            if (time < timeout && !started) {
                portastic.test(port).then(function(isOpen){
                    if (isOpen) {
                        time += interval;
                        setTimeout(check, interval);
                    } else {
                        resolve();
                    }
                });
            } else {
                reject(new Error("Timeout expired, port still open."));
            }
        }
    });
}
