/// <reference types="node" />
import * as child_process from "child_process";
import { INsCapabilities } from "./ins-capabilities";
export declare class AppiumServer {
    private _args;
    private _server;
    private _appium;
    private _port;
    private _runType;
    constructor(_args: INsCapabilities);
    port: number;
    runType: string;
    readonly server: child_process.ChildProcess;
    start(): Promise<boolean>;
    stop(): Promise<{}>;
    private resolveAppiumDependency();
}
