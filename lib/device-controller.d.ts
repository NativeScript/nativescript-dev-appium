import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDeviceManager } from "./interfaces/device-manager";
import { ServiceContext } from "./service/service-context";
import { IDevice } from "mobile-devices-controller";
export declare class DeviceManger implements IDeviceManager {
    private _serveiceContext;
    private static _emulators;
    constructor(port: any, _serveiceContext?: ServiceContext);
    startDevice(args: INsCapabilities): Promise<IDevice>;
    stopDevice(args: INsCapabilities): Promise<any>;
    static kill(device: IDevice): Promise<void>;
    private static getDefaultDevice(args);
}
