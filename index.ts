import { AppiumServer } from "./lib/appium-server";
import { AppiumDriver } from "./lib/appium-driver";
import { ElementHelper } from "./lib/element-helper";
import { NsCapabilities } from "./lib/ns-capabilities";
import { IDeviceManager } from "./lib/interfaces/device-manager";
import { shutdown, findFreePort } from "./lib/utils";

export { AppiumDriver } from "./lib/appium-driver";
export { AppiumServer } from "./lib/appium-server";
export { ElementHelper } from "./lib/element-helper";
export { UIElement } from "./lib/ui-element";
export { Point } from "./lib/point";
export { SearchOptions } from "./lib/search-options";
export { Locator } from "./lib/locators";
export { Direction } from "./lib/direction";
export { DeviceManger } from "./lib/device-controller";
export { IRectangle } from "./lib/interfaces/rectangle";
export { IDeviceManager } from "./lib/interfaces/device-manager";

const nsCapabilities = new NsCapabilities();
const appiumServer = new AppiumServer(nsCapabilities);

let appiumDriver = null;

export async function startServer(port?: number, deviceManager?: IDeviceManager) {
    await appiumServer.start(port || 8300, deviceManager);
    appiumServer.server.on("exit", async (code) => await killProcesses(code));
    appiumServer.server.on("close", async (code) => await killProcesses(code));
    appiumServer.server.on("SIGINT", async (code) => await killProcesses(code));
    appiumServer.server.on("error", async (code) => await killProcesses(code));
    appiumServer.server.on("uncaughtException", () => async (code) => await killProcesses(code));
};

export async function stopServer() {
    if (appiumDriver !== null && appiumDriver.isAlive) {
        await appiumDriver.quit();
    }
    if (appiumServer !== null && appiumServer.server && !appiumServer.server.killed) {
        await appiumServer.stop();
    }
};

export async function createDriver() {
    if (!appiumServer.server) {
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
        await appiumDriver.init();
    }

    // Make sure to turn off "Don't keep activities"
    // in case of previous execution failure.
    await appiumDriver.setDontKeepActivities(false);

    return appiumDriver;
}

const killProcesses = async (code) => {
    if (appiumServer) {
        return await stopServer();
    }
}

process.on("exit", async (code) => await killProcesses(code));
process.on("close", async (code) => await killProcesses(code));
process.on("SIGINT", async (code) => await killProcesses(code));
process.on("error", async (code) => await killProcesses(code));
process.on("uncaughtException", () => async (code) => await killProcesses(code));
