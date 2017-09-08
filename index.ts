import * as portastic from "portastic";
import { AppiumServer } from "./lib/appium-server";
import { AppiumDriver } from "./lib/appium-driver";
import { ElementHelper } from "./lib/element-helper";
import { NsCapabilities } from "./lib/ns-capabilities";

export { AppiumDriver } from "./lib/appium-driver";
export { ElementHelper } from "./lib/element-helper";
export { UIElement } from "./lib/ui-element";
export { Point } from "./lib/point";
export { SearchOptions } from "./lib/search-options";

const nsCapabilities = new NsCapabilities();
const appiumServer = new AppiumServer(nsCapabilities);

let appiumDriver = null;
let counter = 0;
export async function startServer(port?: number) {
    counter++;
    appiumServer.port = port || nsCapabilities.port;
    let retry = false;
    if (!appiumServer.port) {
        appiumServer.port = (await portastic.find({ min: 8600, max: 9080 }))[0];
        retry = true;
    }

    let hasStarted = await appiumServer.start();
    let retryCount = 0;
    while (retry && !hasStarted && retryCount < 5) {
        let tempPort = appiumServer.port + 10;
        tempPort = (await portastic.find({ min: tempPort, max: 9180 }))[0];
        console.log("----------_P " ,tempPort);
        appiumServer.port = tempPort;
        hasStarted = await appiumServer.start();
        retryCount++;
    }

    if (!hasStarted) {
        throw new Error("Appium driver failed to start!!! Run with --verbose option for more info!");
    }

    appiumServer.hasStarted = hasStarted;
};

export async function stopServer() {
    await appiumDriver.quit();
    if (appiumServer.hasStarted) {
        await appiumServer.stop();
    }

    counter++;
    console.log("Counter: " + counter);
};

export async function createDriver() {
    if (!appiumServer.hasStarted) {
        throw new Error("Server is not available!");
    }
    if (!nsCapabilities.appiumCapsLocation) {
        throw new Error("Provided path to appium capabilities is not correct!");
    }
    if (!nsCapabilities.runType) {
        throw new Error("--runType is missing! Make sure it is provided correctly! It is used to parse the configuration for appium driver!");
    }

    if (appiumDriver !== null && appiumDriver.isAlive) {
        return appiumDriver;
    } else if (appiumDriver === null) {
        appiumDriver = await AppiumDriver.createAppiumDriver(appiumServer.port, nsCapabilities);
    } else if (appiumDriver !== null && !appiumDriver.isAlive) {
        await appiumDriver.inint();
    }

    return appiumDriver;
};