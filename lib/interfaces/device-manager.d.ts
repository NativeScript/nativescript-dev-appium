import { INsCapabilities } from "../interfaces/ns-capabilities";
import { IDevice } from "mobile-devices-controller";
export interface IDeviceManager {
    startDevice(args: INsCapabilities): Promise<IDevice>;
    stopDevice(args: INsCapabilities): Promise<IDevice>;
    installApp(args: INsCapabilities): Promise<void>;
    uninstallApp(args: INsCapabilities): Promise<void>;
    getPackageId(device: any, appPath: any): string;
}
