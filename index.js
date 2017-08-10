"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var yargs = require("yargs");
var child_process = require("child_process");
var utils = require("./utils");
var elementFinder = require("./element-finder");
var server_options_1 = require("./server-options");
var appium_driver_1 = require("./appium-driver");
__export(require("./appium-driver"));
var config = (function () {
    var options = yargs
        .option("runType", { describe: "Path to excute command.", type: "string", default: null })
        .option("path", { alias: "p", describe: "Path to app root.", default: process.cwd, type: "string" })
        .option("testFolder", { describe: "E2e test folder name", default: "e2e", type: "string" })
        .option("capsLocation", { describe: "Capabilities location", type: "string" })
        .option("sauceLab", { describe: "SauceLab", default: false, type: "boolean" })
        .option("verbose", { alias: "v", describe: "Log actions", default: false, type: "boolean" })
        .help()
        .argv;
    var config = {
        executionPath: options.path,
        loglevel: options.verbose,
        testFolder: options.testFolder,
        runType: options.runType || process.env.npm_config_runType,
        capsLocation: options.capsLocation || path.join(options.testFolder, "config"),
        isSauceLab: options.sauceLab
    };
    return config;
})();
var executionPath = config.executionPath, loglevel = config.loglevel, testFolder = config.testFolder, runType = config.runType, capsLocation = config.capsLocation, isSauceLab = config.isSauceLab;
var appLocation = utils.appLocation;
var appium = process.platform === "win32" ? "appium.cmd" : "appium";
var projectDir = utils.projectDir();
var pluginBinary = utils.pluginBinary();
var projectBinary = utils.projectBinary();
var pluginRoot = utils.pluginRoot();
var pluginAppiumBinary = utils.resolve(pluginBinary, appium);
var projectAppiumBinary = utils.resolve(projectBinary, appium);
if (fs.existsSync(pluginAppiumBinary)) {
    utils.log("Using plugin-local Appium binary.");
    appium = pluginAppiumBinary;
}
else if (fs.existsSync(projectAppiumBinary)) {
    utils.log("Using project-local Appium binary.");
    appium = projectAppiumBinary;
}
else {
    utils.log("Using global Appium binary.");
}
var server;
var serverOptoins = new server_options_1.ServerOptions(9200);
function startAppiumServer(port) {
    serverOptoins.port = port || serverOptoins.port;
    server = child_process.spawn(appium, ["-p", port], {
        shell: true,
        detached: false
    });
    return utils.waitForOutput(server, /listener started/, 60000);
}
exports.startAppiumServer = startAppiumServer;
function killAppiumServer() {
    // todo: check if allready dead?
    var isAlive = true;
    if (isAlive) {
        return new Promise(function (resolve, reject) {
            server.on("close", function (code, signal) {
                console.log("Appium terminated due " + signal);
                resolve();
            });
            // TODO: What about "error".
            server.kill('SIGINT');
            server = null;
        });
    }
    else {
        return Promise.resolve();
    }
}
exports.killAppiumServer = killAppiumServer;
function createDriver(capabilities, activityName) {
    return appium_driver_1.createAppiumDriver(runType, serverOptoins.port);
}
exports.createDriver = createDriver;
;
function getXPathWithExactText(text) {
    return elementFinder.getXPathByText(text, true, runType);
}
exports.getXPathWithExactText = getXPathWithExactText;
function getXPathContainingText(text) {
    return elementFinder.getXPathByText(text, false, runType);
}
exports.getXPathContainingText = getXPathContainingText;
function getElementClass(name) {
    return elementFinder.getElementClass(name, runType);
}
exports.getElementClass = getElementClass;
//# sourceMappingURL=index.js.map