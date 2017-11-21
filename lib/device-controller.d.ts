import { INsCapabilities } from "./ins-capabilities";
import { IDevice } from "mobile-devices-controller";
export declare class DeviceManger {
    private static _emulators;
    static startDevice(args: INsCapabilities): Promise<IDevice>;
    static stop(args: INsCapabilities): Promise<void>;
    static kill(device: IDevice): Promise<void>;
    private static getDefaultDevice(args);
    private static device(runType);
}
