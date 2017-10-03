import { waitForOutput, resolve, log, isWin, shutdown, executeCommand } from "./utils";
import * as child_process from "child_process";
import { INsCapabilities } from "./ins-capabilities";

const ANDROID_HOME = process.env["ANDROID_HOME"];
const EMULATOR = resolve(ANDROID_HOME, "emulator", "emulator");
const ADB = resolve(ANDROID_HOME, "platform-tools", "adb");
const LIST_DEVICES_COMMAND = ADB + " devices";

export class EmulatorManager {
    private static _emulators: Map<string, EmulatorManager> = new Map();
    private static _emulatorIds: Map<string, string> = new Map();

    constructor(private _id, private _args, private _emulatorProc: child_process.ChildProcess, private _shouldKill) {
    }

    get id() {
        return this._id;
    }

    get emulatorProc() {
        return this._emulatorProc;
    }

    get args() {
        return this._args;
    }

    get shouldKill() {
        return this._shouldKill;
    }

    public static async startEmulator(args: INsCapabilities) {
        if (EmulatorManager._emulatorIds.size === 0) {
            EmulatorManager.loadEmulatorsIds();
        }

        if (!args.reuseDevice) {
            EmulatorManager.kill(EmulatorManager.emulatorId(args.appiumCaps.platformVersion));
        }
        if (!args.appiumCaps.avd || args.appiumCaps.avd === "") {
            log("No avd name provided! We will not start the emulator!", args.verbose);
            return false;
        }

        let id = EmulatorManager.emulatorId(args.appiumCaps.platformVersion) || "5554";

        const response = await EmulatorManager.startEmulatorProcess(args, id);
        if (response.response) {
            EmulatorManager.waitUntilEmulatorBoot(id, args.appiumCaps.lt || 180000);
            EmulatorManager._emulators.set(args.runType, new EmulatorManager(id, args, response.process, !args.reuseDevice));
        } else {
            EmulatorManager._emulators.set(args.runType, new EmulatorManager(id, args, response.process, !args.reuseDevice));
            log("Emulator is probably already started!", args.verbose);
        }

        return response.response;
    }

    public static stop(args: INsCapabilities) {
        if (EmulatorManager._emulators.has(args.runType)) {
            const emu = EmulatorManager._emulators.get(args.runType);
            if (emu.shouldKill) {
                EmulatorManager.kill(emu.id);
            }
        }
    }

    public static kill(port) {
        executeCommand(ADB + " -s emulator-" + port + " emu kill");
    }

    private static waitUntilEmulatorBoot(deviceId, timeOut: number) {
        const startTime = new Date().getTime();
        let currentTime = new Date().getTime();
        let found = false;

        console.log("Booting emulator ...");

        while ((currentTime - startTime) < timeOut * 1000 && !found) {
            currentTime = new Date().getTime();
            found = this.checkIfEmulatorIsRunning("emulator-" + deviceId);
        }

        if (!found) {
            let error = deviceId + " failed to boot in " + timeOut + " seconds.";
            console.log(error, true);
        } else {
            console.log("Emilator is booted!");
        }
    }

    /**
     * 
     * @param deviceId 
     */
    private static checkIfEmulatorIsRunning(deviceId) {
        let isBooted = executeCommand(ADB + " -s " + deviceId + " shell getprop sys.boot_completed").trim() === "1";
        if (isBooted) {
            isBooted = executeCommand(ADB + " -s " + deviceId + " shell getprop init.svc.bootanim").toLowerCase().trim() === "stopped";
        }

        return isBooted;
    }

    public static emulatorId(platformVersion) {
        return EmulatorManager._emulatorIds.get(platformVersion);
    }

    private static async startEmulatorProcess(args: INsCapabilities, id) {
        const emulator = child_process.spawn(EMULATOR, ["-avd ", args.appiumCaps.avd, "-port ", id, args.emulatorOptions], {
            shell: true,
            detached: false
        });

        let response = EmulatorManager.checkIfEmulatorIsRunning(id);
        console.log("KORRRRR", response);
        return { response: response, process: emulator };
    }

    private static loadEmulatorsIds() {
        EmulatorManager._emulatorIds.set("4.2", "5554");
        EmulatorManager._emulatorIds.set("4.3", "5556");
        EmulatorManager._emulatorIds.set("4.4", "5558");
        EmulatorManager._emulatorIds.set("5.0", "5560");
        EmulatorManager._emulatorIds.set("6.0", "5562");
        EmulatorManager._emulatorIds.set("7.0", "5564");
        EmulatorManager._emulatorIds.set("7.1", "5566");
        EmulatorManager._emulatorIds.set("8.0", "5568");
    }
}