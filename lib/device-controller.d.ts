import { INsCapabilities } from "./ins-capabilities";
import { IDevice } from "mobile-devices-controller";
export declare class DeviceController {
    private static _emulators;
    static startDevice(args: INsCapabilities): Promise<any>;
    static stop(args: INsCapabilities): Promise<void>;
    static kill(device: IDevice): Promise<void>;
    private static device(runType);
    private static getDevicesByStatus(devices, status);
}
