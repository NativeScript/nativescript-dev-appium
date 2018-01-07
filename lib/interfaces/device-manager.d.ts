import { INsCapabilities } from "../interfaces/ns-capabilities";
import { IDevice } from "mobile-devices-controller";
export interface IDeviceManager {
    startDevice(args: INsCapabilities): Promise<IDevice>;
    stopDevice(args: INsCapabilities): Promise<IDevice>;
    installApp(args: INsCapabilities): Promise<void>;
    unInstallApp(args: INsCapabilities): Promise<void>;
}
