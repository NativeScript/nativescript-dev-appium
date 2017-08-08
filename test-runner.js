#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const portastic = require("portastic");
const child_process = require("child_process");
const utils = require("./utils");
let mocha = "mocha";

const testFolder = utils.testFolder;
const mochaCustomOptions = utils.mochaOptions;
const projectDir = utils.projectDir();
const pluginBinary = utils.pluginBinary();
const projectBinary = utils.projectBinary();
const pluginRoot = utils.pluginRoot();
const pluginMochaBinary = utils.resolve(pluginBinary, mocha);
let mochaBinary = utils.resolve(projectBinary, mocha);
let capabilitiesLocation = utils.capabilitiesLocation;

if (process.platform === "win32") {
    mocha = "mocha.cmd";
}

if (fs.existsSync(pluginMochaBinary)) {
    mochaBinary = pluginMochaBinary;
}

utils.log("Mocha found at: " + mochaBinary);
const mochaOptsPath = utils.resolve(utils.testFolder, "config", "mocha.opts");
mochaOpts = ['--opts', mochaOptsPath];
utils.log("Mocha options: " + mochaOpts);

tests = child_process.spawn(mochaBinary, mochaOpts, { shell: true, detached: false });
tests.stdout.on('data', function(data) {
    utils.logOut("" + data, true);
});
tests.stderr.on("data", function(data) {
    utils.logErr("" + data, true);
});
tests.on('exit', function(code) {
    console.log('Test runner exited with code ' + code);
    tests = null;
    process.exit(code);
});


process.on("exit", (tests) => utils.shutdown(tests));
process.on('uncaughtException', (tests) => utils.shutdown(tests));