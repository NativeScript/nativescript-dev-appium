import * as yargs from "yargs";
import { join, dirname } from "path";
import { resolve } from "./utils";

export const capabilitiesName = "appium.capabilities.json";

const config = (() => {
    const options = yargs
        .option("runType", { describe: "Path to excute command.", type: "string", default: null })
        .option("testFolder", { describe: "e2e test folder name", default: "e2e", type: "string" })
        .option("appiumCapsLocation", { describe: "Capabilities", type: "string" })
        .option("sauceLab", { describe: "SauceLab", default: false, type: "boolean" })
        .option("port", { alias: "p", describe: "Execution port", type: "string" })
        .option("verbose", { alias: "v", describe: "Log actions", type: "boolean" })
        .option("path", { describe: "path", default: process.cwd(), type: "string" })
        .option("appPath", { describe: "application path", type: "string" })
        .option("storage", { describe: "Storage for images folder.", type: "string" })
        .option("testReports", { describe: "Test reporting folder", type: "string" })
        .option("reuseDevice", { describe: "Reusing device if available.", type: "boolean", defualt: false })
        .option("ignoreDeviceController", { alias: "i-ns-device-controller", describe: "Use default appium options for running emulatos/ simulators.", type: "boolean", defualt: false })
        .option("useDeviceControllerServer", {
            alias: "use-ns-device-controller-server",
            describe: "Use server to boot, kill, subscribe or unsubscribe for devices. Also this flag could be specified in as an evn variable",
            type: "boolean",
            defualt: false
        })
        .option("deviceControllerServerPort", { describe: "Reusing device if available.", type: "boolean", defualt: false })
        .help()
        .argv;

    let appRootPath = options.path;
    if (appRootPath.includes("nativescript-dev-appium")) {
        appRootPath = require('app-root-path').toString();
    }

    if (appRootPath.includes("mocha")) {
        appRootPath = join(appRootPath, "../../..");
    }

    const projectDir = appRootPath;
    const projectBinary = resolve(projectDir, "node_modules", ".bin");
    const pluginRoot = resolve(projectDir, "node_modules", "nativescript-dev-appium");
    const pluginBinary = resolve(pluginRoot, "node_modules", ".bin");

    const config = {
        projectDir: projectDir,
        projectBinary: projectBinary,
        pluginRoot: pluginRoot,
        pluginBinary: pluginBinary,
        port: options.port || process.env.npm_config_port,
        testFolder: options.testFolder || process.env.npm_config_testFolder || "e2e",
        runType: options.runType || process.env.npm_config_runType,
        appiumCapsLocation: options.appiumCapsLocation || join(projectDir, options.testFolder, "config", capabilitiesName),
        isSauceLab: options.sauceLab || process.env.npm_config_sauceLab,
        verbose: options.verbose || process.env.npm_config_loglevel === "verbose",
        appPath: options.appPath || process.env.npm_config_appPath,
        storage: options.storage || process.env.npm_config_STORAGE || process.env.STORAGE,
        testReports: options.testReports || process.env.npm_config_TEST_REPORTS || process.env.TEST_REPORTS,
        reuseDevice: options.reuseDevice || process.env.npm_config_REUSE_DEVICE || process.env.REUSE_DEVICE,
        ignoreDeviceController: options.ignoreDeviceController,
        useDeviceControllerServer: options.useDeviceControllerServer || process.env['USE_DEVICE_CONTROLLER_SERVER'],
        deviceControllerServerPort: parseInt(options.deviceControllerServerPort) || parseInt(process.env['DEVICE_CONTROLLER_SERVER_PORT']) || 8700
    };

    return config;
})();

export const {
    projectDir,
    projectBinary,
    pluginRoot,
    pluginBinary,
    port,
    verbose,
    appiumCapsLocation,
    testFolder,
    runType,
    isSauceLab,
    appPath,
    storage,
    testReports,
    reuseDevice,
    ignoreDeviceController,
    useDeviceControllerServer,
    deviceControllerServerPort
} = config;