import { waitForOutput, resolve, log, isWin, shutdown, executeCommand } from "./utils";
import * as child_process from "child_process";
import { INsCapabilities } from "./ins-capabilities";

import {
    IDevice,
    Device,
    DeviceController,
    Platform,
    Status,
    DeviceType
} from "mobile-devices-controller";


export class DeviceManger {
    private static _emulators: Map<string, IDevice> = new Map();

    public static async startDevice(args: INsCapabilities) {
        if (args.isSauceLab || args.ignoreDeviceController) {
            return DeviceManger.getDefaultDevice(args);
        }

        const allDevices = (await DeviceController.getDivices({ platform: args.appiumCaps.platformName }));
        if (!allDevices || allDevices === null || allDevices.length === 0) {
            console.log("We couldn't find any devices. We will try to proceed to appium! Maybe avd manager is missing")
            console.log("Available devices:\n", allDevices);
        }

        let searchedDevices = DeviceController.filter(allDevices, { name: args.appiumCaps.deviceName });
        if (!searchedDevices || searchedDevices.length === 0) {
            console.log(`No such device ${args.appiumCaps.deviceName}!!!\n Check your device name!!!`);
            console.log("Available devices:\n", allDevices);
        }

        let device: IDevice;

        if (searchedDevices && searchedDevices.length > 0) {

            // Should find new device
            if (!args.reuseDevice) {
                searchedDevices = DeviceController.filter(allDevices, { status: Status.SHUTDOWN });
            }

            // If there is no shutdown device
            if (!device || device === null) {
                searchedDevices = DeviceController.filter(searchedDevices, { status: Status.BOOTED });
            }

            // In case reuse device is true but there weren't any booted devices. We need to fall back and boot new one.
            if (!device || device === null && args.reuseDevice) {
                searchedDevices = DeviceController.filter(searchedDevices, { status: Status.SHUTDOWN });
            }

            if (device.status === Status.SHUTDOWN) {
                await DeviceController.startDevice(device);
                console.log("Started device: ", device);
            } else {
                console.log("Device is already started", device);
                if (!args.reuseDevice) {
                    DeviceController.kill(device);
                    await DeviceController.startDevice(device);
                }
            }
        }

        if (!device || device === null) {
            device = DeviceManger.getDefaultDevice(args);
        }

        DeviceManger._emulators.set(args.runType, device);

        return device;
    }

    public static async stop(args: INsCapabilities) {
        if (DeviceManger._emulators.has(args.runType) && !args.reuseDevice && !args.isSauceLab && !args.ignoreDeviceController) {
            const device = DeviceManger._emulators.get(args.runType);
            await DeviceManger.kill(device);
        }
    }

    public static async kill(device: IDevice) {
        await DeviceManger.kill(device);
    }


    private static getDefaultDevice(args) {
        return new Device(args.appiumCaps.deviceName, args.appiumCaps.platformVersion, undefined, args.appiumCaps.platformName, undefined, undefined);
    }

    private static device(runType) {
        return DeviceManger._emulators.get(runType);
    }

    // private static getDevicesByStatus(devices: Array<IDevice>, status) {
    //     let device: IDevice;
    //     const shutdownDeivces = devices.filter(dev => {
    //         return dev.status === status;
    //     });

    //     if (shutdownDeivces && shutdownDeivces !== null && shutdownDeivces.length > 0) {
    //         device = shutdownDeivces[0];
    //     }

    //     return device;
    // }
}