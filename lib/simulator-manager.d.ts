/// <reference types="node" />
import * as child_process from "child_process";
import { INsCapabilities } from "./ins-capabilities";
export declare class SimulatorManager {
    private _id;
    private _args;
    private _emulatorProc;
    private _shouldKill;
    private static _simulator;
    constructor(_id: any, _args: any, _emulatorProc: child_process.ChildProcess, _shouldKill: any);
    readonly id: any;
    readonly emulatorProc: child_process.ChildProcess;
    readonly args: any;
    static startDevice(args: INsCapabilities): Promise<{}>;
    static stop(args: INsCapabilities): void;
    static killAll(): void;
    private static startSimulatorProcess(args, id);
    private static findSimulatorByParameter(...args);
    private static parseSimulator(sim);
    private static waitUntilSimulatorBoot(id, timeout);
}
export declare class Simulator {
    private _name;
    private _id;
    private _state;
    private _process;
    private _shouldKill;
    constructor(_name: string, _id: string, _state?: string);
    readonly state: string;
    setState(state: 'Booted' | 'Shutdown'): void;
    readonly name: string;
    readonly id: string;
    process: any;
    shouldKill: any;
}
