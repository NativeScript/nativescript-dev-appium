import { INsCapabilities } from "./ins-capabilities";
export declare class EmulatorManager {
    private static _emulators;
    private static _emulatorIds;
    static startEmulator(args: INsCapabilities): Promise<boolean>;
    static stop(args: INsCapabilities): Promise<{}>;
    private static waitUntilEmulatorBoot(deviceId, timeOut);
    /**
     *
     * @param deviceId
     */
    private static checkIfEmulatorIsRunning(deviceId);
    static emulatorId(platformVersion: any): string;
    private static loadEmulatorsIds();
}
