import {
    waitForOutput,
    resolve,
    log,
    isWin,
    shutdown,
    executeCommand,
    logError,
    logInfo,
    logWarn
} from "./utils";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDeviceManager } from "./interfaces/device-manager";

import {
    IDevice,
    Device,
    DeviceController,
    IOSController,
    AndroidController,
    Platform,
    Status,
    DeviceType
} from "mobile-devices-controller";

export class DeviceManager implements IDeviceManager {
    private static _emulators: Map<string, IDevice> = new Map();

    constructor() {
    }

    public async startDevice(args: INsCapabilities): Promise<IDevice> {
        args.appiumCaps.platformName = args.appiumCaps.platformName.toLowerCase();
        let device: IDevice = DeviceManager.getDefaultDevice(args);
        if (process.env["DEVICE_TOKEN"]) {
            device.token = process.env["DEVICE_TOKEN"];
            device.name = process.env["DEVICE_NAME"] || device.name;
            const allDevices = await DeviceController.getDevices({ platform: device.platform });
            const foundDevice = DeviceController.filter(allDevices, { token: device.token.replace("emulator-", "") })[0];
            logInfo("Device: ", foundDevice);
            return foundDevice;
        }

        // When isSauceLab specified we simply do nothing;
        if (args.isSauceLab || args.ignoreDeviceController) {
            args.ignoreDeviceController = true;
            DeviceManager._emulators.set(args.runType, device);
            return device;
        }

        const allDevices = await DeviceController.getDevices({ platform: args.appiumCaps.platformName });
        if (!allDevices || allDevices === null || allDevices.length === 0) {
            logError("We couldn't find any devices. We will try to proceed to appium!")
            console.log("Available devices:\n", allDevices);
            logWarn(`We couldn't find any devices. We will try to proceed to appium!`);
            if (args.appiumCaps.platformVersion.toLowerCase() === Platform.ANDROID) {
                const errMsg = `1. Check if ANDROID_HOME environment variable is set correctly!\n
                2. Check if avd manager is available!
                3. Check appium capabilites and provide correct device options!`;
                logWarn(errMsg);
            }
            args.ignoreDeviceController = true;
        }

        const searchObj = args.appiumCaps.udid ? { token: args.appiumCaps.udid } : { name: args.appiumCaps.deviceName, apiLevel: args.appiumCaps.platformVersion };
        let searchedDevices = DeviceController.filter(allDevices, searchObj);
        if (!searchedDevices || searchedDevices.length === 0) {
            logError(`No such device ${args.appiumCaps.deviceName}!!!`);
            logWarn("All properties like platformVersion, deviceName etc should match!");
            logInfo("Available devices:\t\t\t\t");
            console.log('', allDevices);
        }

        if (searchedDevices && searchedDevices.length > 0) {

            // Should find new device
            if (!args.reuseDevice) {
                device = DeviceController.filter(searchedDevices, { status: Status.SHUTDOWN })[0];
            }

            // If there is no shutdown device
            if (!device || device === null || !device.status) {
                device = DeviceController.filter(searchedDevices, { status: Status.BOOTED })[0];
            }

            // In case reuse device is true but there weren't any booted devices. We need to fall back and boot new one.
            if (!device || device === null && args.reuseDevice) {
                device = DeviceController.filter(searchedDevices, { status: Status.SHUTDOWN })[0];
            }

            if (device.status === Status.SHUTDOWN) {
                await DeviceController.startDevice(device);
                logInfo("Started device: ", device);
            } else {
                device.type === DeviceType.DEVICE ? logInfo("Device is connected:", device) : logInfo("Device is already started", device)
                if (!args.reuseDevice && device.type !== DeviceType.DEVICE) {
                    console.log("Since is it specified without reusing, the device would be shut down and restart!");
                    DeviceController.kill(device);
                    await DeviceController.startDevice(device);
                }
            }
        }

        if (device.platform === Platform.ANDROID) {
            AndroidController.clearLog(device);
        }

        DeviceManager._emulators.set(args.runType, device);

        if (!device || !device.token) {
            console.error("Check appium capabilites and provide correct device options!");
            process.exit(1);
        }
        return device;
    }

    public async stopDevice(args: INsCapabilities): Promise<any> {
        if (DeviceManager._emulators.has(args.runType)
            && !args.reuseDevice
            && !args.isSauceLab
            && !args.ignoreDeviceController) {
            const device = DeviceManager._emulators.get(args.runType);
            await DeviceManager.kill(device);
        }
    }

    public async installApp(args: INsCapabilities): Promise<any> {
        if (args.isIOS) {
            IOSController.installApp(args.device, args.appiumCaps.app);
            console.log(`Application is successfully installed!`)
        } else {
            AndroidController.installApp(args.device, args.appiumCaps.app)
        }
    }

    public async uninstallApp(args: INsCapabilities): Promise<any> {
        if (args.isIOS) {
            await IOSController.uninstallApp(args.device, args.appPath, args.appiumCaps["bundleId"]);
        } else {
            await Promise.resolve(AndroidController.uninstallApp(args.device, args.appiumCaps["appPackage"]));
        }
    }

    public static async kill(device: IDevice) {
        await DeviceController.kill(device);
    }

    public static getDefaultDevice(args: INsCapabilities, deviceName?: string, token?: string, type?: DeviceType, platformVersion?: number) {
        let device = new Device(deviceName || args.appiumCaps.deviceName, platformVersion || args.appiumCaps.platformVersion, type, args.appiumCaps.platformName.toLowerCase(), token, undefined, undefined);
        device.config = { "density": args.appiumCaps.density, "offsetPixels": args.appiumCaps.offsetPixels };
        delete args.appiumCaps.density;
        delete args.appiumCaps.offsetPixels;
        return device;
    }

    public static async setDontKeepActivities(args: INsCapabilities, driver, value) {
        const status = value ? 1 : 0;
        try {
            if (args.isAndroid) {
                if (!args.ignoreDeviceController) {
                    AndroidController.setDontKeepActivities(value, args.device);
                } else if (args.relaxedSecurity) {
                    const output = await DeviceManager.executeShellCommand(driver, { command: "settings", args: ['put', 'global', 'always_finish_activities', status] });
                    console.log(`Output from setting always_finish_activities to ${status}: ${output}`);
                    //check if set 
                    const check = await DeviceManager.executeShellCommand(driver, { command: "settings", args: ['get', 'global', 'always_finish_activities'] });
                    console.info(`Check if always_finish_activities is set correctly: ${check}`);
                }
            } else {
                // Do nothing for iOS ...
            }
        } catch (error) {
            logError(`Could not set don't keep activities: ${status}!`);
            logError(error);
        }
    }

    public static async executeShellCommand(driver, commandAndargs: { command: string, "args": Array<any> }) {
        const output = await driver.execute("mobile: shell", commandAndargs);
        return output;
    }

    public static async getDensity(args: INsCapabilities, driver) {
        args.device.config = args.device.config || {};
        if (args.appiumCaps.platformName.toLowerCase() === "android") {
            if (!args.ignoreDeviceController) {
                args.device.config.density = await AndroidController.getPhysicalDensity(args.device);
            }

            if (args.relaxedSecurity && !args.device.config.density) {
                const d = await DeviceManager.executeShellCommand(driver, { command: "wm", args: ["density"] });
                args.device.config.density = /\d+/ig.test(d) ? parseInt(/\d+/ig.exec(d)[0]) / 100 : NaN;
                console.log(`Device density recieved from adb shell command ${args.device.config.density}`);
            }

            if (args.device.config.density) {
                args.device.config['offsetPixels'] = AndroidController.calculateScreenOffset(args.device.config.density);
            }
        } else {
            IOSController.getDevicesScreenInfo().forEach((v, k, m) => {
                if (args.device.name.includes(k)) {
                    args.device.config = {
                        density: args.device.config['density'] || v.density,
                        offsetPixels: v.actionBarHeight
                    };
                }
            });
        }
    }

    public static async applyDeviceAdditionsSettings(driver, args: INsCapabilities, sessionIfno: any) {
        if (!args.device.config || !args.device.config.offsetPixels) {
            args.device.config = {};
            let density: number;
            if (sessionIfno && sessionIfno.length >= 1) {
                density = sessionIfno[1].deviceScreenDensity ? sessionIfno[1].deviceScreenDensity / 100 : undefined;
            }

            if (density) {
                console.log(`Get density from appium session: ${density}`);
                args.device.config['density'] = density;
                args.device.config['offsetPixels'] = AndroidController.calculateScreenOffset(args.device.config.density);
            }

            if (!density) {
                await DeviceManager.getDensity(args, driver);
                density = args.device.config.density
                args.device.config['offsetPixels'] = AndroidController.calculateScreenOffset(args.device.config.density);
            }

            density ? logInfo(`Device setting:`, args.device.config) : console.log(`Could not resolve device density. Please provide offset in appium config`);
        }
    }

    public getPackageId(device: IDevice, appPath: string): string {
        const appActivity = (device.type === DeviceType.EMULATOR || device.platform === Platform.ANDROID) ? AndroidController.getPackageId(appPath) : IOSController.getIOSPackageId(device.type, appPath);
        return appActivity;
    }
}