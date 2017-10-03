import * as child_process from "child_process";
import { log, resolve, waitForOutput, shutdown, fileExists, isWin, executeCommand } from "./utils";
import { INsCapabilities } from "./ins-capabilities";
import { SimulatorManager } from "./simulator-manager";
import { EmulatorManager } from "./emulator-manager";

export class AppiumServer {
    private _server: child_process.ChildProcess;
    private _appium;
    private _port: number;
    private _runType: string;
    private _hasStarted: boolean;

    constructor(private _args: INsCapabilities) {
        this._runType = this._args.runType;
        this._hasStarted = false;
        this.resolveAppiumDependency();
    }

    get port() {
        return this._port;
    }

    set port(port: number) {
        this._port = port;
    }

    set runType(runType: string) {
        this._runType = runType;
    }

    get runType() {
        return this._runType;
    }

    get server() {
        return this._server;
    }

    get hasStarted() {
        return this._hasStarted;
    }

    set hasStarted(hasStarted) {
        this._hasStarted = hasStarted;
    }

    public async start() {

        if (this._args.appiumCaps.platformName.toLowerCase() === "android") {
            await EmulatorManager.startEmulator(this._args);
        }

        if (!this._args.isSauceLab && this._args.appiumCaps.platformName.toLowerCase().includes("ios")) {
            await SimulatorManager.startDevice(this._args);
        }

        log("Starting server...", this._args.verbose);
        const logLevel = this._args.verbose === true ? "debug" : "info";
        this._server = child_process.spawn(this._appium, ["-p", this.port.toString(), "--log-level", logLevel], {
            shell: true,
            detached: false
        });

        const response: boolean = await waitForOutput(this._server, /listener started/, /Error: listen/, 60000, this._args.verbose);

        return response;
    }

    public async stop() {

        if (this._args.appiumCaps.platformName.toLowerCase() === "android") {
            await EmulatorManager.stop(this._args);
        }

        if (!this._args.isSauceLab && !this._args.reuseDevice && this._args.appiumCaps.platformName.toLowerCase().includes("ios")) {
            await SimulatorManager.stop(this._args);
        }

        return new Promise((resolve, reject) => {
            this._server.on("close", (code, signal) => {
                log(`Appium terminated due signal: ${signal} and code: ${code}`, this._args.verbose);
                resolve();
            });

            this._server.on("exit", (code, signal) => {
                log(`Appium terminated due signal: ${signal} and code: ${code}`, this._args.verbose);
                resolve();
            });

            this._server.on("error", (code, signal) => {
                log(`Appium terminated due signal: ${signal} and code: ${code}`, this._args.verbose);
                resolve();
            });

            this._server.on("disconnect", (code, signal) => {
                log(`Appium terminated due signal: ${signal} and code: ${code}`, this._args.verbose);
                resolve();
            });

            log("Stopping server...", this._args.verbose);
            try {
                if (isWin) {
                    shutdown(this._server, this._args.verbose);
                    this._server.kill("SIGINT");                    
                } else {
                    this._server.kill("SIGINT");
                    this._server.kill("SIGINT");
                    shutdown(this._server, this._args.verbose);
                }
            } catch (error) {
                console.log(error);
            }
        });
    }

    // Resolve appium dependency
    private resolveAppiumDependency() {
        const projectDir = this._args.projectDir;
        const pluginBinary = this._args.pluginBinary;
        const projectBinary = this._args.projectBinary;
        const pluginRoot = this._args.pluginRoot;

        let appium = process.platform === "win32" ? "appium.cmd" : "appium";
        const pluginAppiumBinary = resolve(pluginBinary, appium);
        const projectAppiumBinary = resolve(projectBinary, appium);

        if (fileExists(pluginAppiumBinary)) {
            log("Using plugin-local Appium binary.", this._args.verbose);
            appium = pluginAppiumBinary;
        } else if (fileExists(projectAppiumBinary)) {
            log("Using project-local Appium binary.", this._args.verbose);
            appium = projectAppiumBinary;
        } else {
            const result = executeCommand("npm list -g");
            if (result.includes("appium")) {
                log("Using global Appium binary.", this._args.verbose);
            } else if (result.includes("appium")) {
                const msg = "Appium not found. Please install appium before runnig tests!";
                log(msg, this._args.verbose);
                new Error(msg);
            }
        }

        this._appium = appium;
    }
}