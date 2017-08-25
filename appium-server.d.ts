/// <reference types="node" />
import * as child_process from "child_process";
export declare class AppiumServer {
    private _appium;
    private _server;
    private _port;
    private _runType;
    constructor();
    port: number;
    runType: string;
    readonly server: child_process.ChildProcess;
    start(): Promise<boolean>;
    stop(): Promise<{}>;
    private resolveAppiumDependency();
}
