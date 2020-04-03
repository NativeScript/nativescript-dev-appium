import * as yargs from "yargs";
import { join } from "path";
import { resolvePath, logError, logWarn } from "./utils";
import { INsCapabilitiesArgs } from "./interfaces/ns-capabilities-args";
import { LogImageType } from "./enums/log-image-type";

const config = (() => {
    const options = yargs
        .option("runType",
            {
                describe: "Which option to use from appium capabilities.json",
                type: "string"
            })
        .option("device", {
            describe: "Pass device as argument instead capabilities file: e.g. --device.platform=android and/ or some other device options"
        })
        .option("testFolder",
            {
                describe: "Name of folder with tests",
                default: "e2e",
                type: "string"
            })
        .option("appiumCapsLocation",
            {
                describe: "Custom capabilities location `/some-path/appium.capabilities.json`",
                type: "string"
            })
        .option("appiumCaps", { alias: "caps", describe: "Apply additional appium capabilities" })
        .option("capabilitiesName",
            {
                describe: "Capabilities file name",
                default: "appium.capabilities.json",
                type: "string"
            })
        .option("sauceLab",
            {
                describe: "Use it mandatory for sauceLab run!",
                default: false,
                type: "boolean"
            })
        .option("kobiton",
            {
                describe: "Use it mandatory for Kobiton run!",
                default: false,
                type: "boolean"
            })
        .option("port",
            {
                alias: "p",
                describe: "Appium port",
                type: "number"
            })
        .option("attachToDebug",
            {
                alias: "a",
                describe: "Attach to appium desktop application. Will use first met session!",
                default: false,
                type: "boolean"
            })
        .option("startSession",
            {
                describe: "Start session. This option will start a new session can be reused for tests!",
                default: false,
                type: "boolean"
            })
        .option("sessionId", {
            alias: "s",
            describe: "Provide session id which you want to attach",
            default: false,
            type: "string"
        })
        .option("wdaLocalPort", { alias: "wda", describe: "WDA port", type: "number" })
        .options("derivedDataPath", { 
            describe: "set the unique derived data path root for each driver instance. This will help to avoid possible conflicts and to speed up the parallel execution", 
            type: "string" })
        .option("verbose", { alias: "v", describe: "Log actions", type: "boolean" })
        .option("path", { describe: "Execution path", default: process.cwd(), type: "string" })
        .option("relaxedSecurity", { describe: "appium relaxedSecurity", default: false, type: "boolean" })
        .option("appPath", { describe: "application path", type: "string" })
        .option("storage", { describe: "Storage for images folder.", type: "string" })
        .option("testReports", { describe: "Override default test reporting storage", type: "string" })
        .option("devMode",
            {
                alias: "dev-mode",
                describe: "Skips app installation and uses the one that should already be installed on device! Good to use during development.",
                type: "boolean",
                default: false
            })
        .option("ignoreDeviceController",
            {
                alias: "idc",
                describe: `Use default appium options for running emulators/ simulators. Provide this option will not use custom device controller.
                Device controller is disabled by default when --sauceLab option is provided!`,
                type: "boolean",
                default: false
            })
        .option("cleanApp", { alias: "c", describe: "Clean app before and after run.", type: "boolean", default: false })
        .option("imagesPath", { describe: "comparison images path relative to resources/images", type: "string" })
        .option("logImageTypes", { describe: "Applicable only if testReporter is set", type: 'array', default: [] })
        .help()
        .argv;

    let appRootPath = options.path;
    if (appRootPath.includes("nativescript-dev-appium")) {
        appRootPath = require('app-root-path').toString();
    }

    // if (appRootPath.includes("mocha")) {
    //     appRootPath = join(appRootPath, "../../..");
    // }

    if (options.startSession) {
        options.reuseDevice = true;
    }

    if (options.attachToDebug) {
        options.devMode = true;
        console.log(`Option attachToDebug is set to true. Option --devMode is set true as well !`)
        if (!options.port) {
            logWarn(`Default appium server port 4732!`);
            logWarn(`In order to change it use --port option!`);
        }
    }

    if (options.sessionId) {
        options.attachToDebug = true;
        options.devMode = true;
        if (!options.port) {
            logError(`Provide appium server port that has been used to start session or the default '${port}' one will be used`);
        }
    }

    const projectDir = appRootPath;
    const projectBinary = resolvePath(projectDir, "node_modules", ".bin");
    const pluginRoot = resolvePath(projectDir, "node_modules", "nativescript-dev-appium");
    const pluginBinary = resolvePath(pluginRoot, "node_modules", ".bin");
    let deviceTypeOrPlatform;
    if (!options.runType && !options.device && options._[0]) {
        deviceTypeOrPlatform = options._[0].toLowerCase() === "android" ? "android" : "ios";
    }

    options.driverConfig = options.remoteAddress;

    options.port = options.port || process.env.npm_config_port || process.env["APPIUM_PORT"] || 4723;

    if (!options.driverConfig) {
        options.driverConfig = {
            host: "localhost",
            port: options.port
        };
    }

    options.isSauceLab = options.sauceLab || process.env.npm_config_sauceLab;
    if (options.isSauceLab && !options.remoteAddress) {
        const sauceUser = options.sauceUser || process.env.SAUCE_USER || process.env.npm_config["SAUCE_USER"];
        const sauceKey = options.sauceKey || process.env.SAUCE_KEY || process.env.npm_config["SAUCE_KEY"];

        if (!sauceKey || !sauceUser) {
            throw new Error("Sauce Labs Username or Access Key is missing! Check environment variables for SAUCE_USER and SAUCE_KEY !!!");
        }

        options.driverConfig = "https://" + sauceUser + ":" + sauceKey + "@ondemand.saucelabs.com:443/wd/hub";
    }

    options.kobiton = options.kobiton || process.env.npm_config_kobiton;
    if (options.kobiton && !options.remoteAddress) {
        const kobitonUser = options.kobitonUser || process.env.KOBITON_USERNAME || process.env.npm_config["KOBITON_USERNAME"];
        const kobitonKey = options.kobitonKey || process.env.KOBITON_ACCESS_KEY || process.env.npm_config["KOBITON_ACCESS_KEY"];

        if (!kobitonKey || !kobitonUser) {
            throw new Error("Kobiton Username or Access Key is missing! Check environment variables for KOBITON_USERNAME and KOBITON_ACCESS_KEY !!!");
        }

        options.driverConfig = "https://" + kobitonUser + ":" + kobitonKey + "@api.kobiton.com/wd/hub";
    }
    const config = {
        port: options.port,
        projectDir: projectDir,
        projectBinary: projectBinary,
        pluginRoot: pluginRoot,
        pluginBinary: pluginBinary,
        wdaLocalPort: options.wdaLocalPort || process.env.npm_config_wdaLocalPort || process.env["WDA_LOCAL_PORT"] || 8410,
        derivedDataPath: options.derivedDataPath || process.env.npm_config_derivedDataPath || process.env["DERIVED_DATA_PATH"],
        testFolder: options.testFolder || process.env.npm_config_testFolder || "e2e",
        runType: options.runType || process.env.npm_config_runType,
        appiumCapsLocation: options.appiumCapsLocation || process.env.npm_config_appiumCapsLocation || join(projectDir, options.testFolder, "config", options.capabilitiesName),
        isSauceLab: options.isSauceLab,
        verbose: options.verbose || process.env.npm_config_loglevel === "verbose",
        appPath: options.appPath || process.env.npm_config_appPath,
        storage: options.storage || process.env.npm_config_STORAGE || process.env.STORAGE,
        testReports: options.testReports || process.env.npm_config_testReports || process.env.TEST_REPORTS,
        devMode: options.devMode || process.env.npm_config_devMode || process.env.REUSE_APP,
        cleanApp: !options.devMode && options.cleanApp && !options.sauceLab && !options.ignoreDeviceController,
        ignoreDeviceController: options.ignoreDeviceController || process.env.npm_ignoreDeviceController,
        path: options.path || process.env.npm_path,
        relaxedSecurity: options.relaxedSecurity || process.env.npm_relaxedSecurity,
        attachToDebug: options.attachToDebug || process.env.npm_attachToDebug,
        sessionId: options.sessionId || process.env.npm_sessionId,
        startSession: options.startSession || process.env.npm_startSession,
        capabilitiesName: options.capabilitiesName || process.env.npm_capabilitiesName,
        imagesPath: options.imagesPath || process.env.npm_config_imagesPath,
        startDeviceOptions: options.startDeviceOptions || process.env.npm_config_startDeviceOptions,
        deviceTypeOrPlatform: deviceTypeOrPlatform,
        device: options.device || process.env.npm_config_device,
        driverConfig: options.driverConfig,
        logImageTypes: <Array<LogImageType>>options.logImageTypes,
        appiumCaps: options.appiumCaps
    };

    logWarn(`Parsed args: `, config);

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
    devMode,
    ignoreDeviceController,
    wdaLocalPort,
    derivedDataPath,
    path,
    relaxedSecurity,
    cleanApp,
    attachToDebug,
    sessionId,
    startSession,
    capabilitiesName,
    imagesPath,
    startDeviceOptions,
    deviceTypeOrPlatform,
    device,
    driverConfig,
    logImageTypes,
    appiumCaps
}: INsCapabilitiesArgs = config;