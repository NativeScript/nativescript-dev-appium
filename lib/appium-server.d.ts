import { ChildProcess } from "child_process";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDeviceManager } from "./interfaces/device-manager";
export declare class AppiumServer {
    private _args;
    private _server;
    private _appium;
    private _port;
    private _runType;
    private _hasStarted;
    constructor(_args: INsCapabilities);
    port: number;
    runType: string;
    readonly server: ChildProcess;
    hasStarted: boolean;
    start(port: any, deviceManager?: IDeviceManager): Promise<boolean | this>;
    private startAppiumServer;
    stop(): Promise<{}>;
    private prepDevice;
    private prepApp;
    private resolveAppiumDependency;
}
