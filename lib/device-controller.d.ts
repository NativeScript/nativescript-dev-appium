import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDeviceManager } from "./interfaces/device-manager";
import { IDevice } from "mobile-devices-controller";
export declare class DeviceManger implements IDeviceManager {
    private static _emulators;
    constructor();
    startDevice(args: INsCapabilities): Promise<IDevice>;
    stopDevice(args: INsCapabilities): Promise<any>;
    installApp(args: INsCapabilities): Promise<any>;
    unInstallApp(args: INsCapabilities): Promise<any>;
    static kill(device: IDevice): Promise<void>;
    private static getDefaultDevice(args);
}
