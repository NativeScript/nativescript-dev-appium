import { INsCapabilities } from "./ins-capabilities";
export declare class EmulatorManager {
    private _args;
    private verbose;
    private _emulator;
    constructor(_args: INsCapabilities, verbose?: boolean);
    startEmulator(name: any): Promise<boolean>;
    stop(): Promise<{}>;
}
