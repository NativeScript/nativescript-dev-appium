/// <reference types="node" />
import * as child_process from "child_process";
import { INsCapabilities } from "./ins-capabilities";
export declare class EmulatorManager {
    private _id;
    private _args;
    private _emulatorProc;
    private _shouldKill;
    private static _emulators;
    private static _emulatorIds;
    constructor(_id: any, _args: any, _emulatorProc: child_process.ChildProcess, _shouldKill: any);
    readonly id: any;
    readonly emulatorProc: child_process.ChildProcess;
    readonly args: any;
    readonly shouldKill: any;
    static startEmulator(args: INsCapabilities): Promise<boolean>;
    static stop(args: INsCapabilities): void;
    static kill(port: any): void;
    private static waitUntilEmulatorBoot(deviceId, timeOut);
    /**
     *
     * @param deviceId
     */
    private static checkIfEmulatorIsRunning(deviceId);
    static emulatorId(platformVersion: any): string;
    private static startEmulatorProcess(args, id);
    private static loadEmulatorsIds();
}
