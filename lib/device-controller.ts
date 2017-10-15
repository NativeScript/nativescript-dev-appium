import { waitForOutput, resolve, log, isWin, shutdown, executeCommand } from "./utils";
import * as child_process from "child_process";
import { INsCapabilities } from "./ins-capabilities";

import {
    IDevice,
    Device,
    DeviceManager,
    Platform,
    Status,
    DeviceType
} from "mobile-devices-controller";


export class DeviceController {
    private static _emulators: Map<string, IDevice> = new Map();

    public static async startDevice(args: INsCapabilities) {
        const allDevices = (await DeviceManager.getAllDevices(args.appiumCaps.platformName.toLowerCase()));
        if (!allDevices || allDevices === null || allDevices.size === 0) {
            console.log("We couldn't find any devices. We will try to prossede to appium! Maybe avd manager is missing")
            console.log("Available devices:\n", allDevices);
        }

        let searchedDevices = allDevices.get(args.appiumCaps.deviceName);
        if (!searchedDevices || searchedDevices.length === 0) {
            console.log(`No such device ${args.appiumCaps.deviceName}!!!\n Check your device name!!!`);
            console.log("Available devices:\n", allDevices);
        }

        let device: IDevice;

        if (searchedDevices && searchedDevices.length > 0) {

            // Should find new device
            if (!args.reuseDevice) {
                device = DeviceController.getDevicesByStatus(searchedDevices, Status.SHUTDOWN);
            }

            // If there is no shutdown device
            if (!device || device === null) {
                device = DeviceController.getDevicesByStatus(searchedDevices, Status.BOOTED);
            }

            // If there is no booted device
            if (!device || device === null) {
                device = DeviceController.getDevicesByStatus(searchedDevices, Status.FREE);
            }

            // In case reuse device is true but there weren't any booted devices. We need to fall back and boot new one.
            if (!device || device === null && args.reuseDevice) {
                device = DeviceController.getDevicesByStatus(searchedDevices, Status.SHUTDOWN);
            }

            if (device.status === Status.SHUTDOWN) {
                await DeviceManager.startDevice(device);
                console.log("Started device: ", device);
            } else {
                console.log("Device is alredy started", device);
                if (!args.reuseDevice) {
                    DeviceController.kill(device);
                    await DeviceManager.startDevice(device);
                }
            }
        }

        if (!device || device === null) {
            device = new Device(args.appiumCaps.deviceName, args.appiumCaps.platformVersion, undefined, args.appiumCaps.platform, "5554", undefined);
        }

        DeviceController._emulators.set(args.runType, device);

        return device;
    }

    public static async stop(args: INsCapabilities) {
        if (DeviceController._emulators.has(args.runType) && !args.reuseDevice) {
            const device = DeviceController._emulators.get(args.runType);
            await DeviceManager.kill(device);
        }
    }

    public static async kill(device: IDevice) {
        await DeviceManager.kill(device);
    }

    private static device(runType) {
        return DeviceController._emulators.get(runType);
    }

    private static getDevicesByStatus(devices: Array<IDevice>, status) {
        let device: IDevice;
        const shutdownDeivces = devices.filter(dev => {
            return dev.status === status;
        });

        if (shutdownDeivces && shutdownDeivces !== null && shutdownDeivces.length > 0) {
            device = shutdownDeivces[0];
        }

        return device;
    }
}