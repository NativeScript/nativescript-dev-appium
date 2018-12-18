import * as yargs from "yargs";
import { join } from "path";
import { resolve, logError } from "./utils";
import { INsCapabilitiesArgs } from "./interfaces/ns-capabilities-args";

const config = (() => {
    const options = yargs
        .option("runType",
            {
                describe: "Which option to use from appium capabilities.json",
                type: "string"
            })
        .option("testFolder",
            {
                describe: "e2e test folder name",
                default: "e2e",
                type: "string"
            })
        .option("appiumCapsLocation",
            {
                describe: "Custom capabilities location",
                type: "string"
            })
        .option("sauceLab",
            {
                describe: "Use it mandatory for sauceLab run!",
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
        .option("capabilitiesName",
            {
                describe: "Capabilities file name",
                default: "appium.capabilities.json",
                type: "string"
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
        .option("verbose", { alias: "v", describe: "Log actions", type: "boolean" })
        .option("path", { describe: "Execution path", default: process.cwd(), type: "string" })
        .option("relaxedSecurity", { describe: "appium relaxedSecurity", default: false, type: "boolean" })
        .option("appPath", { describe: "application path", type: "string" })
        .option("storage", { describe: "Storage for images folder.", type: "string" })
        .option("testReports", { describe: "Test reporting folder", type: "string" })
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
        .option("cleanApp", { alias: "c", describe: "Uninstall app after test are finished", type: "boolean", default: false })
        .option("imagesPath", { describe: "comparison images path relative to resources/images", type: "string" })
        .help()
        .argv;

    let appRootPath = options.path;
    if (appRootPath.includes("nativescript-dev-appium")) {
        appRootPath = require('app-root-path').toString();
    }

    if (appRootPath.includes("mocha")) {
        appRootPath = join(appRootPath, "../../..");
    }

    if (options.startSession) {
        options.reuseDevice = true;
    }

    if (options.attachToDebug) {
        options.devMode = true;
        console.log(`Option attachToDebug is set to true. Option --devMode is set true as well !`)
        if (!options.port) {
            logError("Provide appium server port started from desktop application!")
            process.exit(1);
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
    const projectBinary = resolve(projectDir, "node_modules", ".bin");
    const pluginRoot = resolve(projectDir, "node_modules", "nativescript-dev-appium");
    const pluginBinary = resolve(pluginRoot, "node_modules", ".bin");

    const config = {
        projectDir: projectDir,
        projectBinary: projectBinary,
        pluginRoot: pluginRoot,
        pluginBinary: pluginBinary,
        port: options.port || process.env.npm_config_port || process.env["APPIUM_PORT"] || 4723,
        wdaLocalPort: options.wdaLocalPort || process.env.npm_config_wdaLocalPort || process.env["WDA_LOCAL_PORT"] || 8410,
        testFolder: options.testFolder || process.env.npm_config_testFolder || "e2e",
        runType: options.runType || process.env.npm_config_runType,
        appiumCapsLocation: options.appiumCapsLocation || process.env.npm_config_appiumCapsLocation || join(projectDir, options.testFolder, "config", options.capabilitiesName),
        isSauceLab: options.sauceLab || process.env.npm_config_sauceLab,
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
        imagesPath: options.imagesPath || process.env.npm_config_imagesPath
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
    devMode,
    ignoreDeviceController,
    wdaLocalPort,
    path,
    relaxedSecurity,
    cleanApp,
    attachToDebug,
    sessionId,
    startSession,
    capabilitiesName,
    imagesPath
}: INsCapabilitiesArgs = config;
