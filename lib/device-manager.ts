import { logError, logInfo, logWarn, shouldUserMobileDevicesController } from "./utils";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDeviceManager } from "./interfaces/device-manager";
import {
    IDevice,
    DeviceController,
    IOSController,
    AndroidController,
    Platform,
    Status,
    DeviceType,
    sortDescByApiLevelPredicate
} from "mobile-devices-controller";
import { isRegExp, isNumber } from "util";
import { NsCapabilities } from "./ns-capabilities";

export class DeviceManager implements IDeviceManager {
    private static _emulators: Map<string, IDevice> = new Map();

    constructor() {
    }

    public async startDevice(args: INsCapabilities): Promise<IDevice> {
        args.appiumCaps.platformName = args.appiumCaps.platformName.toLowerCase();
        const shouldFullyResetDevice = !args.appiumCaps.udid;
        let device: IDevice = DeviceManager.getDefaultDevice(args);
        const token = process.env["DEVICE_TOKEN"] || process.env.npm_config_deviceToken;
        device.token = token && token.replace("emulator-", "");
        device.name = process.env["DEVICE_NAME"] || device.name;

        DeviceManager.cleanUnsetProperties(device);

        if (args.ignoreDeviceController) {
            console.log("Default device: ", device);
        }

        if (shouldUserMobileDevicesController(args)) {
            device = (await DeviceController.getDevices(device))[0];
            logInfo("Device: ", device);
            return device;
        }

        // When '--isSauceLab' option is set we should do nothing;
        if (args.isSauceLab || args.ignoreDeviceController) {
            args.ignoreDeviceController = true;
            DeviceManager._emulators.set(args.runType, device);
            return device;
        }

        const searchQuery = args.appiumCaps.udid ? { token: args.appiumCaps.udid } : Object.assign(device);
        const foundDevices = (await DeviceController.getDevices(searchQuery))
            .sort((a, b) => sortDescByApiLevelPredicate(a, b));

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
            device = DeviceController.filter(foundDevices, { status: deviceStatus })
                .filter(d => d.type !== DeviceType.TV && d.type !== DeviceType.WATCH)[0];

            // If there is no shutdown device
            if (!device || !device.status) {
                deviceStatus = args.reuseDevice ? Status.SHUTDOWN : Status.BOOTED;
                device = DeviceController.filter(foundDevices, { status: deviceStatus })
                    .filter(d => d.type !== DeviceType.TV && d.type !== DeviceType.WATCH)[0];
            }

            // If the device should not be reused we need to shutdown device and boot a clean instance
            let startDeviceOptions = args.startDeviceOptions || undefined;
            if (!args.reuseDevice && device.status !== Status.SHUTDOWN) {
                await DeviceController.kill(device);
                device.status = Status.SHUTDOWN;
                startDeviceOptions = device.type === DeviceType.EMULATOR ? "-wipe-data -no-snapshot-load -no-boot-anim -no-audio -snapshot clean_boot" : "";
                logInfo("Change appium config to fullReset: false if no restart of the device needed!");
            }

            if (device.type === DeviceType.DEVICE) {
                logInfo("Device is connected:", device)
            }
            if (device.status === Status.SHUTDOWN) {
                device = await DeviceController.startDevice(device, startDeviceOptions, shouldFullyResetDevice);
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

        if (!args.ignoreDeviceController) {
            console.log("Default device: ", device);
        }

        return device;
    }

    public async stopDevice(device: IDevice, args: INsCapabilities): Promise<any> {
        if (!args.reuseDevice
            && !args.isSauceLab
            && !args.ignoreDeviceController) {
            await DeviceManager.kill(device);
        }
    }

    public static async getDevices(query: IDevice): Promise<IDevice[]> {
        return await DeviceController.getDevices(query);
    }

    public async installApp(args: INsCapabilities): Promise<any> {
        if (args.isIOS) {
            IOSController.uninstallApplication(args.device, args.appiumCaps.app);
            console.log(`Application is successfully installed!`)
        } else {
            AndroidController.uninstallApplication(args.device, args.appiumCaps.app)
        }
    }

    public async uninstallApp(args: INsCapabilities): Promise<any> {
        if (args.isIOS) {
            await IOSController.uninstallApplication(args.device, args.appPath, args.appiumCaps["bundleId"]);
        } else {
            await Promise.resolve(AndroidController.uninstallApplication(args.device, args.appiumCaps["appPackage"]));
        }
    }

    public static async kill(device: IDevice) {
        if (device) {
            await DeviceController.kill(device);
        }
    }

    public static async getInstalledApps(device: IDevice): Promise<string[]> {
        return await DeviceController.getInstalledApplication(device);
    }

    public static getDefaultDevice(args: INsCapabilities, deviceName?: string, token?: string, type?: DeviceType, platformVersion?: number): IDevice {
        let device: IDevice = {
            name: deviceName || args.appiumCaps.deviceName,
            type: type,
            platform: args.appiumCaps.platformName.toLowerCase(),
            token: token,
            apiLevel: platformVersion || args.appiumCaps.deviceApiLevel || args.appiumCaps.platformVersion,
            config: { "density": args.appiumCaps.density, "offsetPixels": args.appiumCaps.offsetPixels }
        }

        DeviceManager.cleanUnsetProperties(device);

        return device;
    }

    private static convertViewportRectToIRectangle(viewportRect) {
        if (!viewportRect) {
            return viewportRect;
        }
        return {
            x: viewportRect.left,
            y: viewportRect.top,
            width: viewportRect.width,
            height: viewportRect.height,
        };
    }

    public static applyAppiumSessionInfoDetails(args: INsCapabilities, sessionInfoDetails) {
        if (args.isAndroid) {
            const sizeArr = sessionInfoDetails.deviceScreenSize.split("x");
            args.device.deviceScreenSize = { width: sizeArr[0], height: sizeArr[1] };

            args.device.apiLevel = sessionInfoDetails.deviceApiLevel;
            args.device.deviceScreenDensity = sessionInfoDetails.deviceScreenDensity / 100;
            args.device.config = { "density": args.device.deviceScreenDensity || args.device.config.density, "offsetPixels": +sessionInfoDetails.statBarHeight || args.device.config.offsetPixels };
        } else {
            args.device.apiLevel = sessionInfoDetails.platformVersion;
            args.device.deviceScreenDensity = sessionInfoDetails.pixelRatio || args.device.config.density;
            const offsetPixels = +sessionInfoDetails.viewportRect.top - +sessionInfoDetails.statBarHeight;
            args.device.config = { "density": sessionInfoDetails.pixelRatio || args.device.config.density, "offsetPixels": isNumber(offsetPixels) ? offsetPixels : args.device.config.offsetPixels };
        }

        args.device.statBarHeight = sessionInfoDetails.statBarHeight;
        args.device.viewportRect = DeviceManager.convertViewportRectToIRectangle(sessionInfoDetails.viewportRect);
        args.device.token = args.device.token || sessionInfoDetails.udid;

        return args.device;
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

    public static async executeShellCommand(driver, commandArgs: { command: string, "args": Array<any> }) {
        const output = await driver.execute("mobile: shell", commandArgs);
        return output;
    }

    /**
     * Android only
     * @param args 
     * @param driver 
     */
    public static async setDensity(args: INsCapabilities, driver) {
        args.device.config = args.device.config || {};
        if (args.appiumCaps.platformName.toLowerCase() === "android") {
            if (!args.ignoreDeviceController) {
                args.device.config.density = await AndroidController.getPhysicalDensity(args.device);
            }

            if (args.relaxedSecurity && !args.device.config.density) {
                const d = await DeviceManager.executeShellCommand(driver, { command: "wm", args: ["density"] });
                args.device.config.density = /\d+/ig.test(d) ? parseInt(/\d+/ig.exec(d)[0]) / 100 : NaN;
                console.log(`Device density received from adb shell command ${args.device.config.density}`);
            }

            if (args.device.config.density) {
                args.device.config['offsetPixels'] = AndroidController.calculateScreenOffset(args.device.config.density);
            }
        }
    }

    // public static async applyDeviceAdditionsSettings(args: INsCapabilities, appiumCaps: any) {
    //     if (appiumCaps) {
    //         args.device.config.offsetPixels = appiumCaps.offsetPixels || args.device.config.offsetPixels;
    //         args.device.config.density = appiumCaps.density || args.device.config.density;
    //     }
    // }

    public static async applyDeviceAdditionsSettings(driver, args: INsCapabilities, sessionInfo: any) {
        if ((!args.device.viewportRect || !args.device.viewportRect.x) && (!args.device.config || !isNumber(args.device.config.offsetPixels))) {
            args.device.config = {};
            let density: number;
            if (sessionInfo && Object.getOwnPropertyNames(sessionInfo).length >= 1) {
                density = sessionInfo.pixelRatio ? sessionInfo.pixelRatio : undefined;
            }

            if (density) {
                console.log(`Get density from appium session: ${density}`);
                args.device.config['density'] = density;
                args.device.config['offsetPixels'] = AndroidController.calculateScreenOffset(args.device.config.density);
            }

            if (!density && !args.isIOS) {
                await DeviceManager.setDensity(args, driver);
                density = args.device.config.density
                args.device.config['offsetPixels'] = AndroidController.calculateScreenOffset(args.device.config.density);
            }

            density ? logInfo(`Device setting:`, args.device.config) : console.log(`Could not resolve device density. Please provide offset in appium config`);
        }
    }

    public getPackageId(device: IDevice, appPath: string): string {
        const appActivity = (device.type === DeviceType.EMULATOR || device.platform === Platform.ANDROID) ? AndroidController.getPackageId(appPath) : IOSController.getBundleId(device.type, appPath);
        return appActivity;
    }

    private static cleanUnsetProperties(obj) {
        Object.getOwnPropertyNames(obj).forEach(prop => !obj[prop] && delete obj[prop]);
    }
}