import { waitForOutput, resolve, log, isWin, shutdown, executeCommand } from "./utils";
import * as child_process from "child_process";
import { INsCapabilities } from "./ins-capabilities";

const XCRUN = "xcrun ";
const SIMCTL = XCRUN + " simctl ";
const XCRUNLISTDEVICES_COMMAND = SIMCTL + " list devices ";
const BOOT_DEVICE_COMMAND = XCRUN + " instruments -w ";
const BOOTED = "Booted";
const SHUTDOWN = "Shutdown";
const OSASCRIPT_QUIT_SIMULATOR_COMMAND = "osascript -e 'tell application \"Simulator\" to quit'";

export class SimulatorManager {
    private static _simulator: Map<string, Simulator> = new Map();

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

    public static async startDevice(args: INsCapabilities) {
        return new Promise(async (resolve, reject) => {
            let simulators: Array<Simulator> = new Array();
            let process = null;
            let id = "";

            if (!args.reuseDevice) {
                SimulatorManager.killAll();
            } else {
                simulators = SimulatorManager.findSimulatorByParameter(args.appiumCaps.deviceName, BOOTED);
            }

            if (simulators.length > 0) {
                id = simulators[0].id;
                args.appiumCaps.udid = id;
                SimulatorManager._simulator.set(args.runType, simulators[0]);

                console.log(`Found simulator with name: ${simulators[0].name}; id: ${simulators[0].id}; status:${simulators[0].state}`);
                resolve(true);
            }
            if (simulators.length === 0) {
                let simulators = SimulatorManager.findSimulatorByParameter(args.appiumCaps.deviceName, SHUTDOWN);
                id = simulators[0].id;

                executeCommand(XCRUN + " erase " + id);
                process = SimulatorManager.startSimulatorProcess(args, id);

                let responce: boolean = await waitForOutput(process, /Waiting for device to boot/, new RegExp("Failed to load", "i"), args.appiumCaps.lt || 180000, args.verbose);
                if (responce === true) {
                    SimulatorManager.waitUntilSimulatorBoot(id, args.appiumCaps.lt || 180000);
                    let tempSim = new Simulator(args.appiumCaps.deviceName, id);
                    tempSim.process = process;
                    tempSim.shouldKill = true;
                    tempSim.setState("Booted");
                    SimulatorManager._simulator.set(args.runType, tempSim);
                    console.log(`Launched simulator with name: ${tempSim.name}; id: ${tempSim.id}; status: ${tempSim.state}`);
                    args.appiumCaps.udid = id;

                    setTimeout(function () {
                        resolve(true);
                    }, 10000);
                } else {
                    log("Simulator is probably already started!", args.verbose);
                    resolve(true);
                }
            }
        });
    }

    public static stop(args: INsCapabilities) {
        if (SimulatorManager._simulator.has(args.runType)) {
            const sim = SimulatorManager._simulator.get(args.runType);
            if (sim.shouldKill) {
                log(`Killing simulator with id ${sim.id}`, true);
                executeCommand(SIMCTL + "  shutdown " + sim.id);
                SimulatorManager.killAll();
            }
        } else {
            log("Killing all simulators", true);
            SimulatorManager.killAll();
        }
    }

    public static killAll() {
        const log = executeCommand("killall Simulator ");
        executeCommand(OSASCRIPT_QUIT_SIMULATOR_COMMAND);
    }

    private static startSimulatorProcess(args: INsCapabilities, id) {
        const simProcess = child_process.spawn(BOOT_DEVICE_COMMAND, [id], {
            shell: true,
            detached: false
        });

        return simProcess;
    }

    private static findSimulatorByParameter(...args) {
        const simulators = executeCommand(XCRUNLISTDEVICES_COMMAND).split("\n");
        const devices: Array<Simulator> = new Array<Simulator>();

        simulators.forEach((sim) => {
            let shouldAdd = true;
            args.forEach(element => {
                if (sim.toLocaleLowerCase().includes(element.toLowerCase())) {
                    shouldAdd = shouldAdd && true;
                } else {
                    shouldAdd = false;
                }
            });

            if (shouldAdd) {
                devices.push(SimulatorManager.parseSimulator(sim));
            }
        });

        return devices;
    }

    private static parseSimulator(sim) {
        const parts = sim.split(" (");
        if (parts.length < 2) {
            return undefined;
        }
        const name = parts[0].trim().toLowerCase();
        const id = parts[1].replace(")", "").trim();
        let args = "";
        if (parts.length === 3) {
            args = parts[2].replace(")", "").trim();
        }

        return new Simulator(name, id, args);
    }

    private static waitUntilSimulatorBoot(id, timeout) {
        let booted = SimulatorManager.findSimulatorByParameter(id, BOOTED).length > 0;
        const startTime = new Date().getTime();
        let currentTime = new Date().getTime();

        console.log("Booting simulator ...");

        while ((currentTime - startTime) < timeout && !booted) {
            currentTime = new Date().getTime();
            booted = SimulatorManager.findSimulatorByParameter(id, BOOTED).length > 0;
        }

        if (!booted) {
            let error = "Simulator with " + id + " failed to boot";
            console.log(error, true);
        } else {
            console.log("Simulator is booted!");
        }
    }
}

export class Simulator {
    private _process;
    private _shouldKill;

    constructor(private _name: string, private _id: string, private _state?: string) { }

    get state() {
        return this._state;
    }

    public setState(state: 'Booted' | 'Shutdown') {
        this._state = state;
    }

    get name() {
        return this._name;
    }

    get id() {
        return this._id;
    }

    get process() {
        return this._process;
    }

    set process(process) {
        this._process = process;
    }

    get shouldKill() {
        return this._shouldKill;
    }

    set shouldKill(shouldKill) {
        this._shouldKill = shouldKill;
    }

}