import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDeviceManager } from "./interfaces/device-manager";
import { IDevice, DeviceType } from "mobile-devices-controller";
export declare class DeviceManager implements IDeviceManager {
    private static _emulators;
    constructor();
    startDevice(args: INsCapabilities): Promise<IDevice>;
    stopDevice(device: IDevice, args: INsCapabilities): Promise<any>;
    static getDevices(query: IDevice): Promise<IDevice[]>;
    installApp(args: INsCapabilities): Promise<any>;
    uninstallApp(args: INsCapabilities): Promise<any>;
    static kill(device: IDevice): Promise<void>;
    static getInstalledApps(device: IDevice): Promise<string[]>;
    static getDefaultDevice(args: INsCapabilities, deviceName?: string, token?: string, type?: DeviceType, platformVersion?: number): IDevice;
    private static convertViewportRectToIRectangle;
    static applyAppiumSessionInfoDetails(args: INsCapabilities, sessionInfoDetails: any): any;
    static setDontKeepActivities(args: INsCapabilities, driver: any, value: any): Promise<void>;
    static executeShellCommand(driver: any, commandArgs: {
        command: string;
        "args": Array<any>;
    }): Promise<any>;
    /**
     * Android only
     * @param args
     * @param driver
     */
    static setDensity(args: INsCapabilities, driver: any): Promise<void>;
    static applyDeviceAdditionsSettings(driver: any, args: INsCapabilities, sessionInfo: any): Promise<void>;
    getPackageId(device: IDevice, appPath: string): string;
    private static cleanUnsetProperties;
}
