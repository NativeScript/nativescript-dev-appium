require("./appium-setup");
const glob = require("glob");
const fs = require("fs");
const path = require("path");
const wd = require("wd");
const yargs = require('yargs');
const child_process = require("child_process");
const utils = require("./utils");
const elementFinder = require("./element-finder");
import { ServerOptions } from './server-options';

const config = (() => {
    const options = yargs
        .option("runType", { describe: "Path to excute command.", type: "string", default: null })
        .option("path", { alias: "p", describe: "Path to app root.", default: process.cwd, type: "string" })
        .option("testFolder", { describe: "E2e test folder name", default: "e2e", type: "string" })
        .option("capsLocation", { describe: "Capabilities location", type: "string" })
        .option("sauceLab", { describe: "SauceLab", default: false, type: "boolean" })
        .option("verbose", { alias: "v", describe: "Log actions", default: false, type: "boolean" })
        .help()
        .argv;

    const config = {
        executionPath: options.path,
        loglevel: options.verbose,
        testFolder: options.testFolder,
        runType: options.runType || process.env.npm_config_runType,
        capsLocation: options.capsLocation || path.join(options.testFolder, "config"),
        isSauceLab: options.sauceLab
    }
    return config;
})();

const {
    executionPath,
    loglevel,
    testFolder,
    runType,
    capsLocation,
    isSauceLab
} = config;

const appLocation = utils.appLocation;
let appium = process.platform === "win32" ? "appium.cmd" : "appium";
const projectDir = utils.projectDir();
const pluginBinary = utils.pluginBinary();
const projectBinary = utils.projectBinary();
const pluginRoot = utils.pluginRoot();
const pluginAppiumBinary = utils.resolve(pluginBinary, appium);
const projectAppiumBinary = utils.resolve(projectBinary, appium);

let caps;
let customCapabilitiesConfigs;
let customCapabilities;

try {
    customCapabilitiesConfigs = require("./capabilities-helper").searchCustomCapabilities(capsLocation);
    if (customCapabilitiesConfigs) {
        customCapabilities = JSON.parse(customCapabilitiesConfigs);
        utils.log(customCapabilities);
    }
} catch (error) {
    utils.logErr("No capabilities provided!!!");
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
const serverOptoins = new ServerOptions(9200);
export function startAppiumServer(port){
    serverOptoins.port = port || serverOptoins.port;
    server = child_process.spawn(appium, ["-p", port], {
        shell: true,
        detached: false
    });

    return utils.waitForOutput(server, /listener started/, 60000);
}

export function killAppiumServer(){
    // todo: check if allready dead?
    var isAlive = true;
    if (isAlive) {
        return new Promise((resolve, reject) => {
            server.on("close", (code, signal) => {
                console.log(`Appium terminated due ${signal}`);
                resolve();
            });
            // TODO: What about "error".
            server.kill('SIGINT');
            server = null;
        });
    } else {
        return Promise.resolve();
    }
}

export function createDriver(capabilities?, activityName?){
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

    let config = {
        host: "localhost",
        port: serverOptoins.port
    };

    if (isSauceLab) {
        const sauceUser = process.env.SAUCE_USER;
        const sauceKey = process.env.SAUCE_KEY;

        if (!sauceKey || !sauceUser) {
            throw new Error("Sauce Labs Username or Access Key is missing! Check environment variables for SAUCE_USER and SAUCE_KEY !!!");
        }

        // TODO: Should be tested
        config = {
            host: "https://" + sauceUser + ":" + sauceKey + "@ondemand.saucelabs.com:443/wd/hub",
            port: 0
        }
    }

    const driver = wd.promiseChainRemote(config);
    configureLogging(driver);

    if (appLocation) {
        caps.app = isSauceLab ? "sauce-storage:" + appLocation : appLocation;
    } else if (!caps.app) {
        console.log("Getting caps.app!");
        caps.app = getAppPath();
    }

    console.log("Creating driver!");
    return driver.init(caps);
};

export function configureLogging(driver){
    driver.on("status", function (info) {
        utils.log(info.cyan);
    });
    driver.on("command", function (meth, path, data) {
        utils.log(" > " + meth.yellow + path.grey + " " + (data || ""));
    });
    driver.on("http", function (meth, path, data) {
        utils.log(" > " + meth.magenta + path + " " + (data || "").grey);
    });
};

export function getXPathWithExactText(text){
    return elementFinder.getXPathByText(text, true, runType);
}

export function getXPathContainingsText(text){
    return elementFinder.getXPathByText(text, false, runType);
}

export function getElementClass (name){
    return elementFinder.getElementClass(name, runType);
}

function getAppPath() {
    console.log("runType " + runType);
    if (runType.includes("android")) {
        const apks = glob.sync("platforms/android/build/outputs/apk/*.apk").filter(function (file) { return file.indexOf("unaligned") < 0; });
        return apks[0];
    } else if (runType.includes("ios-simulator")) {
        const simulatorApps = glob.sync("platforms/ios/build/emulator/**/*.app");
        return simulatorApps[0];
    } else if (runType.includes("ios-device")) {
        const deviceApps = glob.sync("platforms/ios/build/device/**/*.ipa");
        return deviceApps[0];
    } else {
        throw new Error("No 'app' capability provided and incorrect 'runType' convention used: " + runType +
            ". In order to automatically search and locate app package please use 'android','ios-device','ios-simulator' in your 'runType' option. E.g --runType=android23, --runType=ios-simulator10iPhone6");
    }
};