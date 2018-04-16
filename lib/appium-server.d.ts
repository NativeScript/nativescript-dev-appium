/// <reference types="node" />
import * as child_process from "child_process";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDeviceManager } from "./interfaces/device-manager";
export declare class AppiumServer {
    private _args;
    private _server;
    private _appium;
    private _port;
    private _runType;
    private _hasStarted;
    private _deviceManager;
    constructor(_args: INsCapabilities);
    port: number;
    runType: string;
    readonly server: child_process.ChildProcess;
    hasStarted: boolean;
    start(port: any, deviceManager?: IDeviceManager): Promise<boolean>;
    private startAppiumServer(logLevel);
    stop(): Promise<{}>;
    private prepareDevice(deviceManager);
    private prepareApp();
    private resolveAppiumDependency();
}
