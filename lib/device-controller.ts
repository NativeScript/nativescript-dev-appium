import {
    waitForOutput,
    resolve,
    log,
    isWin,
    shutdown,
    executeCommand,
    findFreePort
} from "./utils";
import * as child_process from "child_process";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDeviceManager } from "./interfaces/device-manager";
import { ServiceContext } from "./service/service-context";

import {
    IDevice,
    Device,
    DeviceController,
    Platform,
    Status,
    DeviceType
} from "mobile-devices-controller";


export class DeviceManger implements IDeviceManager {
    private static _emulators: Map<string, IDevice> = new Map();

    constructor(port, private _serveiceContext: ServiceContext = undefined) {
        if (!this._serveiceContext) {
            this._serveiceContext = ServiceContext.createServer(port);
        }
    }

    public async startDevice(args: INsCapabilities): Promise<IDevice> {
        let device: IDevice = DeviceManger.getDefaultDevice(args);
        // When isSauceLab specified we simply do nothing;
        if (args.isSauceLab || args.ignoreDeviceController) {
            DeviceManger._emulators.set(args.runType, device);

            return device;
        }

        // Using serve to manage deivces.
        if (args.useDeviceControllerServer) {
            const d = await this._serveiceContext.subscribe(args.appiumCaps.deviceName, args.appiumCaps.platformName.toLowerCase(), args.appiumCaps.platformVersion, args.appiumCaps.app);
            if (!d || !(d as IDevice)) {
                console.error("", d);
                throw new Error("Missing device: " + d);
            }
            console.log(`Device: ${d}`)
            DeviceManger._emulators.set(args.runType, d);

            return d;
        }

        const allDevices = (await DeviceController.getDevices({ platform: args.appiumCaps.platformName }));
        if (!allDevices || allDevices === null || allDevices.length === 0) {
            console.log("We couldn't find any devices. We will try to proceed to appium! Maybe avd manager is missing")
            console.log("Available devices:\n", allDevices);
        }

        const searchObj = args.appiumCaps.udid ? { token: args.appiumCaps.udid } : { name: args.appiumCaps.deviceName, apiLevel: args.appiumCaps.platformVersion };
        let searchedDevices = DeviceController.filter(allDevices, searchObj);
        if (!searchedDevices || searchedDevices.length === 0) {
            console.log(`No such device ${args.appiumCaps.deviceName}!!!\n Check your device name!!!`);
            console.log("Available devices:\n", allDevices);
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
                console.log("Started device: ", device);
            } else {
                console.log("Device is already started", device);
                if (!args.reuseDevice && device.type !== DeviceType.EMULATOR && device.type !== DeviceType.SIMULATOR) {
                    console.log("Since is it specified without reusing, the device would be shut down and restart!");
                    DeviceController.kill(device);
                    await DeviceController.startDevice(device);
                }
            }
        }

        DeviceManger._emulators.set(args.runType, device);

        return device;
    }

    public async stopDevice(args: INsCapabilities) {
        if (args.useDeviceControllerServer) {
            const device = DeviceManger._emulators.get(args.runType);

            const d = await this._serveiceContext.unsubscribe(device.token);
            if (!d) {
                console.error("", d);
                throw new Error("Missing device: " + d);
            }

            try {
                await this._serveiceContext.releasePort(args.port);
                if (args.appiumCaps.wdaLocalPort) {
                    await this._serveiceContext.releasePort(args.appiumCaps.wdaLocalPort);
                }
            } catch (error) {
                console.log(error);
            }
        } else if (DeviceManger._emulators.has(args.runType)
            && !args.reuseDevice
            && !args.isSauceLab
            && !args.ignoreDeviceController
            && !args.useDeviceControllerServer) {
            const device = DeviceManger._emulators.get(args.runType);
            await DeviceManger.kill(device);
        }
    }

    public static async kill(device: IDevice) {
        await DeviceController.kill(device);
    }

    private static getDefaultDevice(args) {
        return new Device(args.appiumCaps.deviceName, args.appiumCaps.platformVersion, undefined, args.appiumCaps.platformName, undefined, undefined);
    }
}