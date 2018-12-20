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
        console.log("Default device: ", device);
        const token = process.env["DEVICE_TOKEN"] || process.env.npm_config_deviceToken;
        if (token) {
            device.token = token;
            device.name = process.env["DEVICE_NAME"] || device.name;
            const foundDevice = await DeviceController.getDevices({ token: device.token.replace("emulator-", "") })[0];
            logInfo("Device: ", foundDevice);
            return foundDevice;
        }

        // When isSauceLab specified we simply do nothing;
        if (args.isSauceLab || args.ignoreDeviceController) {
            args.ignoreDeviceController = true;
            DeviceManager._emulators.set(args.runType, device);
            return device;
        }

        const searchQuery = args.appiumCaps.udid ? { token: args.appiumCaps.udid } : device;

        const foundDevices = await DeviceController.getDevices(searchQuery);
        if (!foundDevices || foundDevices.length === 0) {
            logError("We couldn't find any devices of type: ", searchQuery);
            logError("We will try to proceed to appium!");
            if (device.platform) {
                console.log("Available devices:\t\t\t\t", await DeviceController.getDevices({ platform: device.platform }));
            } else {
                console.log("Available devices:\t\t\t\t", await DeviceController.getDevices({}));
            }
            logWarn(`We couldn't find any devices. We will try to proceed to appium!`);
            if (args.appiumCaps.platformVersion.toLowerCase() === Platform.ANDROID) {
                const errMsg = `1. Check if ANDROID_HOME environment variable is set correctly!\n
                2. Check if avd manager is available!
                3. Check appium capabilities and provide correct device options!`;
                logWarn(errMsg);
            }
            args.ignoreDeviceController = true;
            return device;
        }

        if (args.verbose) {
            console.log("Found devices: ", foundDevices);
        }

        if (foundDevices && foundDevices.length > 0) {
            let deviceStatus = args.reuseDevice ? Status.BOOTED : Status.SHUTDOWN;
            device = DeviceController.filter(foundDevices, { status: deviceStatus })[0];

            // If there is no shutdown device
            if (!device || !device.status) {
                deviceStatus = args.reuseDevice ? Status.SHUTDOWN : Status.BOOTED;
                device = DeviceController.filter(foundDevices, { status: deviceStatus })[0];
            }

            // If the device should not be reused we need to shutdown device and boot a clean instance
            let startDeviceOptions = args.startDeviceOptions || undefined;
            if (!args.reuseDevice && device.status !== Status.SHUTDOWN) {
                await DeviceController.kill(device);
                device.status = Status.SHUTDOWN;
                startDeviceOptions = device.type === DeviceType.EMULATOR ? "-wipe-data -no-snapshot-load -no-boot-anim -no-audio" : "";
                logInfo("Change appium config to fullReset: false if no restart of the device needed!");
            }

            if (device.type === DeviceType.DEVICE) {
                logInfo("Device is connected:", device)
            }
            if (device.status === Status.SHUTDOWN) {
                await DeviceController.startDevice(device, startDeviceOptions);
                try {
                    delete device.process;
                } catch (error) { }

                logInfo("Started device: ", device);
            }
        }

        if (device.platform === Platform.ANDROID) {
            AndroidController.clearLog(device);
        }

        DeviceManager._emulators.set(args.runType, device);

        if (!device || !device.token) {
            console.error("Check appium capabilities and provide correct device options!");
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
        let device: IDevice = {
            name: deviceName || args.appiumCaps.deviceName,
            type: type,
            platform: args.appiumCaps.platformName.toLowerCase(),
            token: token,
            apiLevel: platformVersion || args.appiumCaps.platformVersion,
            config: { "density": args.appiumCaps.density, "offsetPixels": args.appiumCaps.offsetPixels }
        }

        delete args.appiumCaps.density;
        delete args.appiumCaps.offsetPixels;

        Object.getOwnPropertyNames(device).forEach(prop => !device[prop] && delete device[prop]);

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