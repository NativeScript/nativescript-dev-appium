import * as fs from "fs";
import * as path from "path";
import * as yargs from 'yargs';
import * as child_process from "child_process";
import * as utils from "./utils";
import { AppiumServer } from './appium-server';
import { resolveCapabilities } from "./capabilities-helper";
import { AppiumDriver } from './appium-driver';
import { ElementHelper } from './element-helper';
import { createAppiumDriver } from './appium-driver';
import * as portastic from "portastic";
export * from "./appium-driver";
export * from "./search-options";

// TODO: Update variables consider also this from utils. 
const config = (() => {
    const options = yargs
        .option("runType", { describe: "Path to excute command.", type: "string", default: null })
        .option("testFolder", { describe: "e2e test folder name", default: "e2e", type: "string" })
        .option("capabilities", { describe: "Capabilities", type: "string" })
        .option("sauceLab", { describe: "SauceLab", default: false, type: "boolean" })
        .option("port", { alias: "p", describe: "Execution port", type: "string" })
        .option("verbose", { alias: "v", describe: "Log actions", default: false, type: "boolean" })
        .help()
        .argv;

    const config = {
        executionPath: options.path,
        port: options.port,
        loglevel: options.verbose,
        testFolder: options.testFolder,
        runType: options.runType || process.env.npm_config_runType,
        capabilities: options.capabilities || path.join(process.cwd(), options.testFolder, "config", utils.capabilitiesName),
        isSauceLab: options.sauceLab
    }
    return config;
})();

const {
    executionPath,
    loglevel,
    capabilities,
    testFolder,
    runType,
    isSauceLab
} = config;

const server = new AppiumServer();

export async function startServer(port?: number) {
    server.port = port || config.port;
    if (!port) {
        server.port = (await portastic.find({ min: 8600, max: 9080 }))[0];
    }
    return await server.start();
};

export function stopServer() {
    return server.stop();
};

const caps: any = resolveCapabilities(capabilities, runType);
export function createDriver() {
    if (!caps) {
        throw new Error("Provided path to appium capabilities is not correct!");
    }
    if (!runType) {
        throw new Error("--runType is missing! Make sure it is provided correctly! It is used to parse the configuration for appium driver!");
    }
    return createAppiumDriver(runType, server.port, caps, isSauceLab);
};

export function elementHelper() {
    return new ElementHelper(this.caps.platformName.toLowerCase(), this.caps.platformVersion.toLowerCase());
}

process.on("exit", (server) => utils.shutdown(server));
process.on('uncaughtException', (server) => utils.shutdown(server)); 
