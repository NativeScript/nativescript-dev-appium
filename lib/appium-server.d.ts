/// <reference types="node" />
import * as child_process from "child_process";
import { INsCapabilities } from "./interfaces/ns-capabilities";
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
    readonly server: child_process.ChildProcess;
    hasStarted: boolean;
    start(): Promise<boolean>;
    stop(): Promise<{}>;
    private resolveAppiumDependency();
}
