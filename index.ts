import { AppiumServer } from "./lib/appium-server";
import { AppiumDriver } from "./lib/appium-driver";
import { NsCapabilities } from "./lib/ns-capabilities";
import { IDeviceManager } from "./lib/interfaces/device-manager";
import * as frameComparerHelper from "./lib/frame-comparer";
import { FrameComparer } from "./lib/frame-comparer";
import { DeviceManager } from "./lib/device-manager";
import { DeviceController } from "mobile-devices-controller";
import { logInfo, logError } from "./lib/utils";
import { INsCapabilities } from "./lib/interfaces/ns-capabilities";
import { INsCapabilitiesArgs } from "./lib/interfaces/ns-capabilities-args";
import * as parser from "./lib/parser"

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
export { LogType } from "./lib/log-types";
export { INsCapabilities } from "./lib/interfaces/ns-capabilities";
export { INsCapabilitiesArgs } from "./lib/interfaces/ns-capabilities-args";
export { logInfo, logError, logWarn } from "./lib/utils";
export { ITestReporter } from "./lib/interfaces/test-reporter";
export { screencapture } from "./lib/helpers/screenshot-manager";
export { LogImageType } from "./lib/enums/log-image-type";
export { ImageHelper, IImageCompareOptions } from "./lib/image-helper";
export { DeviceOrientation } from "./lib/enums/device-orientation";

export const nsCapabilities: INsCapabilities = new NsCapabilities(parser);

const appiumServer = new AppiumServer(nsCapabilities);
let frameComparer: FrameComparer;
let appiumDriver = null;

if (nsCapabilities.startSession) {
    startServer(nsCapabilities.port).then(s => {
        createDriver().then((d: AppiumDriver) => {
            logInfo("Session has started successfully!");
            d.sessionId().then(session => {
                logInfo(`Session id: ${session}`);
                logInfo(`Appium server port: ${appiumServer.port}`);
            }).catch(error => {
                logError('Something went wrong! Appium driver failed to start. Check appium config file.');
                logError(error);
            });
        }).catch(error => {
            logError('Something went wrong! Appium driver failed to start. Check appium config file.');
            logError(error);
        });
    }).catch(error => {
        logError('Something went wrong! Appium server failed to start. Check appium config file!');
        logError(error);
    });
}

export async function startServer(port?: number, deviceManager?: IDeviceManager) {
    await appiumServer.start(port || nsCapabilities.port, deviceManager);
    await attachToExitProcessHookup(appiumServer.server, "appium");
    return appiumServer;
}

export async function stopServer() {
    if (appiumDriver && appiumDriver.isAlive) {
        await appiumDriver.quit();
    }
    if (appiumServer && appiumServer.server && !appiumServer.server.killed) {
        await appiumServer.stop();
    }

    if (nsCapabilities.cleanApp && !nsCapabilities.ignoreDeviceController) {
        await DeviceController.uninstallApplication(nsCapabilities.device, nsCapabilities.appPath);
        logInfo("Application from device is uninstalled.")
    }
};

export async function createDriver(args?: INsCapabilitiesArgs) {
    if (args) {
        nsCapabilities.extend(args);
    }
    if (!nsCapabilities.port) {
        nsCapabilities.port = appiumServer.port;
    }
    if (nsCapabilities.attachToDebug) {
        if (!appiumDriver) {
            appiumDriver = await AppiumDriver.createAppiumDriver(nsCapabilities);
        }
        return appiumDriver;
    }
    if (!appiumServer.server && (!nsCapabilities.isSauceLab || !nsCapabilities.kobiton)) {
        logInfo("Server is not available! To start appium server programmaticаlly use startServer()!");
    }
    if (!nsCapabilities.appiumCapsLocation) {
        throw new Error("Provided path to appium capabilities is not correct!");
    }
    if (!nsCapabilities.runType && !nsCapabilities.appiumCaps) {
        throw new Error("--runType is missing! Make sure it is provided correctly! It is used to parse the configuration for appium driver!");
    }

    if (appiumDriver !== null && appiumDriver.isAlive) {
        return appiumDriver;
    } else if (appiumDriver === null) {
        appiumDriver = await AppiumDriver.createAppiumDriver(nsCapabilities);
    } else if (appiumDriver !== null && !appiumDriver.isAlive) {
        await appiumDriver.init();
    }

    // Make sure to turn off "Don't keep activities"
    // in case of previous execution failure.
    await DeviceManager.setDontKeepActivities(nsCapabilities, appiumDriver.driver, false);

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
    process.removeAllListeners();
    try {
        //if (isWin() && process) {
        // process.exit(0);
        //}
    } catch (error) { }
}

const attachToExitProcessHookup = (processToAttach, processName) => {
    const signals = ['exit', 'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'];
    if (!processToAttach) {
        return;
    }
    signals.forEach(function (sig) {
        processToAttach.once(sig, async function () {
            await killProcesses(sig);
            console.log(`Exited from ${processName}`);
            processToAttach.removeListener(sig, killProcesses);
        });
    });
}