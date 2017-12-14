import { INsCapabilities } from "../interfaces/ns-capabilities";
import { IDevice } from "mobile-devices-controller";

export interface IDeviceManager {
    startDevice(args: INsCapabilities): IDevice
    stopDevice(args: INsCapabilities): IDevice
}