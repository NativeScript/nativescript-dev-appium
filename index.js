"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
require("./appium-setup");
var glob = require("glob");
var fs = require("fs");
var path = require("path");
var wd = require("wd");
var yargs = require('yargs');
var child_process = require("child_process");
var utils = require("./utils");
var elementFinder = require("./element-finder");
var server_options_1 = require("./server-options");
var appium_driver_1 = require("./appium-driver");
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
var caps;
var customCapabilitiesConfigs;
var customCapabilities;
try {
    customCapabilitiesConfigs = require("./capabilities-helper").searchCustomCapabilities(capsLocation);
    if (customCapabilitiesConfigs) {
        customCapabilities = JSON.parse(customCapabilitiesConfigs);
        utils.log(customCapabilities);
    }
}
catch (error) {
    utils.logErr("No capabilities provided!!!");
}
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
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var config, sauceUser, sauceKey, driver;
        return tslib_1.__generator(this, function (_a) {
            console.log("Creating driver");
            caps = capabilities;
            if (!activityName) {
                activityName = "com.tns.NativeScriptActivity";
            }
            if (!caps) {
                caps = customCapabilities[runType];
                if (!caps) {
                    throw new Error("Incorrect test run type: " + runType + " . Available run types are :" + customCapabilitiesConfigs);
                }
            }
            config = {
                host: "localhost",
                port: serverOptoins.port
            };
            if (isSauceLab) {
                sauceUser = process.env.SAUCE_USER;
                sauceKey = process.env.SAUCE_KEY;
                if (!sauceKey || !sauceUser) {
                    throw new Error("Sauce Labs Username or Access Key is missing! Check environment variables for SAUCE_USER and SAUCE_KEY !!!");
                }
                // TODO: Should be tested
                config = {
                    host: "https://" + sauceUser + ":" + sauceKey + "@ondemand.saucelabs.com:443/wd/hub",
                    port: 0
                };
            }
            driver = wd.promiseChainRemote(config);
            configureLogging(driver);
            if (appLocation) {
                caps.app = isSauceLab ? "sauce-storage:" + appLocation : appLocation;
            }
            else if (!caps.app) {
                console.log("Getting caps.app!");
                caps.app = getAppPath();
            }
            console.log("Creating driver!");
            return [2 /*return*/, new appium_driver_1.AppiumDriver(driver.init(caps), runType)];
        });
    });
}
exports.createDriver = createDriver;
;
function configureLogging(driver) {
    driver.on("status", function (info) {
        utils.log(info.cyan);
    });
    driver.on("command", function (meth, path, data) {
        utils.log(" > " + meth.yellow + path.grey + " " + (data || ""));
    });
    driver.on("http", function (meth, path, data) {
        utils.log(" > " + meth.magenta + path + " " + (data || "").grey);
    });
}
exports.configureLogging = configureLogging;
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
function getAppPath() {
    console.log("runType " + runType);
    if (runType.includes("android")) {
        var apks = glob.sync("platforms/android/build/outputs/apk/*.apk").filter(function (file) { return file.indexOf("unaligned") < 0; });
        return apks[0];
    }
    else if (runType.includes("ios-simulator")) {
        var simulatorApps = glob.sync("platforms/ios/build/emulator/**/*.app");
        return simulatorApps[0];
    }
    else if (runType.includes("ios-device")) {
        var deviceApps = glob.sync("platforms/ios/build/device/**/*.ipa");
        return deviceApps[0];
    }
    else {
        throw new Error("No 'app' capability provided and incorrect 'runType' convention used: " + runType +
            ". In order to automatically search and locate app package please use 'android','ios-device','ios-simulator' in your 'runType' option. E.g --runType=android23, --runType=ios-simulator10iPhone6");
    }
}
;
//# sourceMappingURL=index.js.map