import { waitForOutput, resolve, log, isWin, shutdown, executeCommand } from "./utils";
import * as child_process from "child_process";
import { INsCapabilities } from "./ins-capabilities";

import {
    DeviceManager,
    AndroidManager,
    IOSManager,
    IDevice,
    Platform,
    Status
} from "mobile-devices-controller";


export class DeviceController {
    private static _emulators: Map<string, IDevice> = new Map();

    public static async startDevice(args: INsCapabilities) {
        const devices = (await DeviceManager.getAllDevices(args.appiumCaps.platformName.toLowerCase(), args.appiumCaps.deviceName));
        if (!devices || devices === null || devices.size) {
            console.log("Available devices:\n", devices);
            throw new Error(`No such device ${args.appiumCaps.deviceName}!!!\n Check availabe emulators!!!`);
        }

        let device: IDevice;
        // Should find new device
        if (!args.reuseDevice) {
            device = DeviceController.getDevicesByStatus(devices, Status.SHUTDOWN);
        }

        // If there is no shutdown device
        if (!device || device === null) {
            device = DeviceController.getDevicesByStatus(devices, Status.BOOTED);
        }

        // If there is no booted device
        if (!device || device === null) {
            device = DeviceController.getDevicesByStatus(devices, Status.FREE);
        }

        // In case reuse device is true but there weren't any booted devices. We need to fall back and boot new one.
        if (!device || device === null && args.reuseDevice) {
            device = DeviceController.getDevicesByStatus(devices, Status.SHUTDOWN);
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

        if (device.token && args.appiumCaps.platformName.toLowerCase() === Platform.ANDROID) {
            const density = AndroidManager.getPhysicalDensity(device.token);
            const offsetPixels = AndroidManager.getPixelsOffset(device.token);
            device.config = {
                density: density,
                offsetPixels: offsetPixels,
            };
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