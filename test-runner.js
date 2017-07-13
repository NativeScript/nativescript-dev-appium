#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const portastic = require("portastic");
const child_process = require("child_process");
const utils = require("./utils");
let appium = "appium";
let mocha = "mocha";

const projectDir = utils.projectDir();
const pluginBinary = utils.pluginBinary();
const projectBinary = utils.projectBinary();
const pluginRoot = utils.pluginRoot();
const pluginAppiumBinary = utils.resolve(pluginBinary, appium);
const projectAppiumBinary = utils.resolve(projectBinary, appium);
const pluginMochaBinary = utils.resolve(pluginBinary, mocha);
const testFolder = process.env.npm_config_testfolder || "e2e-tests";
const verbose = process.env.npm_config_loglevel === "verbose";
let mochaBinary = utils.resolve(projectBinary, mocha);
let capabilitiesLocation = process.env.npm_config_capsLocation;

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

if (process.platform === "win32") {
    appium = "appium.cmd";
    mocha = "mocha.cmd";
}

if (fs.existsSync(pluginAppiumBinary)) {
    console.log("Using plugin-local Appium binary.");
    appium = pluginAppiumBinary;
} else if (fs.existsSync(projectAppiumBinary)) {
    console.log("Using project-local Appium binary.");
    appium = projectAppiumBinary;
} else {
    console.log("Using global Appium binary.");
}

if (fs.existsSync(pluginMochaBinary)) {
    mochaBinary = pluginMochaBinary;
}

log("Mocha found at: " + mochaBinary);
mochaOpts = [
    "--recursive",
    testFolder
];

let server, tests;
portastic.find({ min: 9200, max: 9300 }).then(function (ports) {
    const port = ports[0];
    server = child_process.spawn(appium, ["-p", port, "--no-reset"], { detached: false });

    server.stdout.on("data", function (data) {
        logOut("" + data);
    });
    server.stderr.on("data", function (data) {
        logErr("" + data);
    });
    server.on('exit', function (code) {
        server = null;
        logOut('Appium Server process exited with code ' + code);
        process.exit();
    });

    waitForOutput(server, /listener started/, 60000).then(function () {
        process.env.APPIUM_PORT = port;
        tests = child_process.spawn(mochaBinary, mochaOpts, { shell: true, detached: false, env: getTestEnv() });
        tests.stdout.on('data', function (data) {
            logOut("" + data, true);
        });
        tests.stderr.on("data", function (data) {
            logErr("" + data, true);
        });
        tests.on('exit', function (code) {
            console.log('Test runner exited with code ' + code);
            if (process.platform === "win32") {
                // The default kill doesn't kill the sub-children...
                killPid(server.pid);
            } else {
                server.kill();
            }
            server = null;
            tests = null;
            process.exit(code);
        });
    }, function (err) {
        console.log("Test runner could not start: " + err);
        server.kill();
        process.exit(1);
    });
});

process.on("exit", shutdown);
process.on('uncaughtException', shutdown);

function shutdown() {
    if (tests) {
        if (process.platform === "win32") {
            killPid(tests.pid);
        } else {
            tests.kill();
        }
        tests = null;
    }
    if (server) {
        if (process.platform === "win32") {
            killPid(server.pid);
        } else {
            server.kill();
        }
        server = null;
    }
}

function killPid(pid) {
    let output = child_process.execSync('taskkill /PID ' + pid + ' /T /F');
}

function getTestEnv() {
    const testEnv = JSON.parse(JSON.stringify(process.env));
    if (verbose) {
        testEnv.VERBOSE_LOG = "true";
    }
    return testEnv;
}

function waitForOutput(process, matcher, timeout) {
    return new Promise(function (resolve, reject) {
        var abortWatch = setTimeout(function () {
            process.kill();
            console.log("Timeout expired, output not detected for: " + matcher);
            reject(new Error("Timeout expired, output not detected for: " + matcher));
        }, timeout);

        process.stdout.on("data", function (data) {
            var line = "" + data;
            if (matcher.test(line)) {
                clearTimeout(abortWatch);
                resolve();
            }
        });
    });
}

function searchCustomCapabilities() {
    const fileName = "appium.capabilities.json";
    const pluginAppiumCapabilitiesLocation = utils.resolve(pluginRoot, fileName);
    const appAppiumCapabilitiesLocation = utils.resolve(projectDir, fileName);
    const customCapabilitiesLocation = utils.resolve(projectDir, capabilitiesLocation, fileName);

    if (fs.existsSync(customCapabilitiesLocation)) {
        setCustomCapabilities(customCapabilitiesLocation)
    } else if (fs.existsSync(pluginAppiumCapabilitiesLocation)) {
        setCustomCapabilities(pluginAppiumCapabilitiesLocation)
    } else if (fs.existsSync(appAppiumCapabilitiesLocation)) {
        setCustomCapabilities(appAppiumCapabilitiesLocation)
    }
}

function setCustomCapabilities(appiumCapabilitiesLocation) {
    const file = fs.readFileSync(appiumCapabilitiesLocation);
    process.env.APPIUM_CAPABILITIES = file;
    console.log("Custom capabilities found.");
}

searchCustomCapabilities();
