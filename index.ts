import { AppiumServer } from "./lib/appium-server";
import { AppiumDriver } from "./lib/appium-driver";
import { ElementHelper } from "./lib/element-helper";
import { NsCapabilities } from "./lib/ns-capabilities";
import { IDeviceManager } from "./lib/interfaces/device-manager";
import { shutdown, findFreePort } from "./lib/utils";
import * as frameComparerHelper from "./lib/frame-comparer";
import { FrameComparer } from "./lib/frame-comparer";
import { DeviceManager } from "./lib/device-manager";
import { DeviceController } from "mobile-devices-controller";

export { AppiumDriver } from "./lib/appium-driver";
export { AppiumServer } from "./lib/appium-server";
export { ElementHelper } from "./lib/element-helper";
export { UIElement } from "./lib/ui-element";
export { Point } from "./lib/point";
export { SearchOptions } from "./lib/search-options";
export { Locator } from "./lib/locators";
export { Direction } from "./lib/direction";
export { DeviceManager } from "./lib/device-manager";
export { FrameComparer } from "./lib/frame-comparer";
export { IRectangle } from "./lib/interfaces/rectangle";
export { IDeviceManager } from "./lib/interfaces/device-manager";

const nsCapabilities = new NsCapabilities();
const appiumServer = new AppiumServer(nsCapabilities);
let frameComparer: FrameComparer;
let appiumDriver = null;

const attachToExitProcessHoockup = (processToExitFrom, processName) => {
    const signals = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'];
    signals.forEach(function (sig) {
        processToExitFrom.once(sig, async function () {
            await killProcesses(sig);
            console.log(`Exited from ${processName}`);
            processToExitFrom.removeListener(sig, killProcesses);
        });
    });
}
export async function startServer(port?: number, deviceManager?: IDeviceManager) {
    await appiumServer.start(port || 8300, deviceManager);
    await attachToExitProcessHoockup(appiumServer.server, "appium");
}

export async function stopServer() {
    if (appiumDriver && appiumDriver.isAlive) {
        await appiumDriver.quit();
    }
    if (appiumServer && appiumServer.server && !appiumServer.server.killed) {
        await appiumServer.stop();
    }

    if (nsCapabilities.cleanApp) {
        await DeviceController.uninstallApp(nsCapabilities.device, nsCapabilities.appPath);
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
    await DeviceManager.setDontKeepActivities(nsCapabilities, appiumDriver, false);

    return appiumDriver;
}

/**
 * Provide instance of FrameComparer in order to compare frames/ images from video
 * Please read carefully README.md before using it.
 * @throws exception in order the dependecies are not installed properly.
 */
export function loadFrameComparer() {
    if (!frameComparer) {
        frameComparer = frameComparerHelper.loadFrameComparer(nsCapabilities);
    }

    return frameComparer;
}

const killProcesses = async (code) => {
    console.log(`About to exit with code: ${code}`);
    if (appiumServer) {
        await stopServer();
    }
}

process.once("exit", async (code) => await killProcesses(code));

attachToExitProcessHoockup(process, "main process");