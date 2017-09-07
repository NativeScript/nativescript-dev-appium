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
        .help()
        .argv;

    let appRootPath = options.path;
    if (appRootPath === "nativescript-dev-appium") {
        appRootPath = require('app-root-path').toString();
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
        appRootPath: appRootPath,
        port: options.port || process.env.npm_config_port,
        testFolder: options.testFolder || process.env.npm_config_testFolder || "e2e",
        runType: options.runType || process.env.npm_config_runType,
        appiumCapsLocation: options.appiumCapsLocation || join(appRootPath, options.testFolder, "config", capabilitiesName),
        isSauceLab: options.sauceLab,
        verbose: options.verbose || process.env.npm_config_loglevel === "verbose",
        appPath: options.appPath
    }
    return config;
})();

export const {
    projectDir,
    projectBinary,
    pluginRoot,
    pluginBinary,
    appRootPath,
    port,
    verbose,
    appiumCapsLocation,
    testFolder,
    runType,
    isSauceLab,
    appPath
} = config;