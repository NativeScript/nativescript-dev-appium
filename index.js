require("./appium-setup");
const glob = require("glob");
const fs = require("fs");
const path = require("path");
const wd = require("wd");
const yargs = require('yargs');
const child_process = require("child_process");
const utils = require("./utils");
const elementFinder = require("./element-finder");

const options = yargs
    .option("runType", { describe: "Path to excute command.", type: "string" })
    .option("path", { alias: "p", describe: "Path to app root.", default: process.cwd, type: "string" })
    .option("testFolder", { describe: "E2e test folder name", default: "e2e", type: "string" })
    .option("capsLocation", { describe: "Capabilities location", type: "string" })
    .option("sauceLab", { describe: "SauceLab", default: false, type: "boolean" })
    .option("verbose", { alias: "v", describe: "Log actions", default: false, type: "boolean" })
    .help()
    .argv;

process.env.npm_config_executionPath = options.path;
process.env.npm_config_loglevel = options.verbose;
process.env.npm_config_testFolder = options.testFolder;
process.env.npm_config_runType = options.runType === undefined ? process.env.npm_config_runType : options.runType;
options.runType = process.env.npm_config_runType;
process.env.npm_config_capsLocation = options.capsLocation === undefined ? path.join(options.testFolder, "config") : options.capsLocation;
options.capsLocation = process.env.npm_config_capsLocation;
console.log("OPTIONS: ", options);

const testRunType = options.runType;
const isSauceLab = options.sauceLab;
let appLocation = utils.appLocation;
let appium = "appium";
let caps;

const projectDir = utils.projectDir();
const pluginBinary = utils.pluginBinary();
const projectBinary = utils.projectBinary();
const pluginRoot = utils.pluginRoot();
const pluginAppiumBinary = utils.resolve(pluginBinary, appium);
const projectAppiumBinary = utils.resolve(projectBinary, appium);

let customCapabilitiesConfigs;
let customCapabilities;


try {
    customCapabilitiesConfigs = require("./capabilities-helper").searchCustomCapabilities(options.capsLocation);
    if (customCapabilitiesConfigs) {
        customCapabilities = JSON.parse(customCapabilitiesConfigs);
        utils.log(customCapabilities);
    }
} catch (error) {
    utils.logErr("No capabilities provided!!!");
}

if (process.platform === "win32") {
    appium = "appium.cmd";
}

if (fs.existsSync(pluginAppiumBinary)) {
    utils.log("Using plugin-local Appium binary.");
    appium = pluginAppiumBinary;
} else if (fs.existsSync(projectAppiumBinary)) {
    utils.log("Using project-local Appium binary.");
    appium = projectAppiumBinary;
} else {
    utils.log("Using global Appium binary.");
}

let server;
let serverPort = 9200;
exports.startAppiumServer = function(port) {
    serverPort = port;
    server = child_process.spawn(appium, ["-p", port], {
        shell: true,
        detached: false
    });

    return utils.waitForOutput(server, /listener started/, 60000);
}

exports.killAppiumServer = () => {
    server.kill(0);
    server = null;
}

exports.createDriver = (capabilities, activityName) => {
    console.log("Creating driver");
    caps = capabilities;
    if (!activityName) {
        activityName = "com.tns.NativeScriptActivity";
    }

    if (!caps) {
        caps = customCapabilities[testRunType];
        if (!caps) {
            throw new Error("Incorrect test run type: " + testRunType + " . Available run types are :" + customCapabilitiesConfigs);
        }
    }

    let config = {
        host: "localhost",
        port: serverPort
    };

    if (isSauceLab) {
        const sauceUser = process.env.SAUCE_USER;
        const sauceKey = process.env.SAUCE_KEY;

        if (!sauceKey || !sauceUser) {
            throw new Error("Sauce Labs Username or Access Key is missing! Check environment variables for SAUCE_USER and SAUCE_KEY !!!");
        }

        config = "https://" + sauceUser + ":" + sauceKey + "@ondemand.saucelabs.com:443/wd/hub";
    }

    const driver = wd.promiseChainRemote(config);
    exports.configureLogging(driver);

    if (appLocation) {
        caps.app = isSauceLab ? "sauce-storage:" + appLocation : appLocation;
    } else if (!caps.app) {
        console.log("Getting caps.app!");
        caps.app = getAppPath();
    }

    console.log("Creating driver!");
    return driver.init(caps);
};


exports.configureLogging = (driver) => {
    driver.on("status", function(info) {
        utils.log(info.cyan);
    });
    driver.on("command", function(meth, path, data) {
        utils.log(" > " + meth.yellow + path.grey + " " + (data || ""));
    });
    driver.on("http", function(meth, path, data) {
        utils.log(" > " + meth.magenta + path + " " + (data || "").grey);
    });
};

exports.getXPathByText = (text, exactMatch) => {
    if (exactMatch === undefined) {
        exactMatch = true;
    }
    return elementFinder.getXPathByText(text, exactMatch, testRunType);
}

function getAppPath() {
    console.log("testRunType " + testRunType);
    if (testRunType.includes("android")) {
        const apks = glob.sync("platforms/android/build/outputs/apk/*.apk").filter(function(file) { return file.indexOf("unaligned") < 0; });
        return apks[0];
    } else if (testRunType.includes("ios-simulator")) {
        const simulatorApps = glob.sync("platforms/ios/build/emulator/**/*.app");
        return simulatorApps[0];
    } else if (testRunType.includes("ios-device")) {
        const deviceApps = glob.sync("platforms/ios/build/device/**/*.ipa");
        return deviceApps[0];
    } else {
        throw new Error("No 'app' capability provided and incorrect 'runType' convention used: " + testRunType +
            ". In order to automatically search and locate app package please use 'android','ios-device','ios-simulator' in your 'runType' option. E.g --runType=android23, --runType=ios-simulator10iPhone6");
    }
};