import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDeviceManager } from "./interfaces/device-manager";
import { IDevice } from "mobile-devices-controller";
export declare class DeviceManger implements IDeviceManager {
    private static _emulators;
    constructor();
    startDevice(args: INsCapabilities): Promise<IDevice>;
    stopDevice(device: IDevice, args: INsCapabilities): Promise<any>;
    installApp(args: INsCapabilities): Promise<any>;
    uninstallApp(args: INsCapabilities): Promise<any>;
    static kill(device: IDevice): Promise<void>;
    private static getDefaultDevice;
    getPackageId(device: IDevice, appPath: string): string;
    static setDontKeepActivities(nsArgs: INsCapabilities, driver: any, value: boolean): Promise<void>;
    static executeShellCommand(driver: any, commandAndargs: {
        command: string;
        "args": Array<any>;
        includeStderr?: boolean;
    }): Promise<any>;
    static getDensity(nsArgs: any, driver: any): Promise<void>;
}
