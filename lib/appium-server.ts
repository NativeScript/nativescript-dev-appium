import * as child_process from "child_process";
import {
    log,
    resolve,
    waitForOutput,
    shutdown,
    fileExists,
    isWin,
    executeCommand,
    findFreePort
} from "./utils";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDeviceManager } from "./interfaces/device-manager";
import { DeviceManger } from "./device-controller";
import { AndroidController } from "mobile-devices-controller";

export class AppiumServer {
    private _server: child_process.ChildProcess;
    private _appium;
    private _port: number;
    private _runType: string;
    private _hasStarted: boolean;
    private _deviceManager: IDeviceManager;

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

    public async start(port, deviceManager: IDeviceManager = new DeviceManger()) {
        this._deviceManager = deviceManager;
        if (!this._args.device) {
            const device = await this._deviceManager.startDevice(this._args);
            this._args.device = device;
        }

        if (this._args.devMode) {
            const appPackage = this._args.isAndroid ? "appPackage" : "bundleId";
            const appFullPath = this._args.appiumCaps.app;

            if (appFullPath && !this._args.appiumCaps[appPackage]) {
                console.log(`Trying to resolve automatically ${appPackage}!`);
                this._args.appiumCaps[appPackage] = this._deviceManager.getPackageId(this._args.device, appFullPath);
                console.log(`Setting capabilities ${this._args.runType}{ "${appPackage}" : "${this._args.appiumCaps[appPackage]}" }!`);
            }

            if (!this._args.appiumCaps[appPackage]) {
                throw new Error(`In order to use reuse app functionality, please set ${appPackage} in ${this._args.appiumCapsLocation} file!`);
            }

            this._args.appiumCaps.app = "";
        }

        if (this._args.isAndroid && (!this._args.appiumCaps['appActivity'] || this._args.appiumCaps['appActivity'].trim() === "")) {
            if (fileExists(this._args.appPath)) {
                this._args.appiumCaps['appActivity'] = AndroidController.getLaunchableActivity(this._args.appPath);
                console.log(`Setting capabilities ${this._args.runType}{ "appActivity" : "${this._args.appiumCaps['appActivity']}" }!`);
            } else {
                console.error(`No launchable activity found. You should set it here ${this._args.appiumCapsLocation} in runType: ${this._args.runType}!`);
            }
        }
        if (!this._args.devMode) {
            this._deviceManager.installApp(this._args);
        }
        log("Starting server...", this._args.verbose);
        const logLevel = this._args.verbose === true ? "debug" : "info";
        this.port = port || this._args.port;
        let retry = false;

        this.startAppiumServer(logLevel);

        let response = await waitForOutput(this._server, /listener started/, /Error: listen/, 60000, this._args.verbose);

        let retries = 11;
        while (retries > 0 && !response) {
            retries--;
            this.port += 10;
            this.port = (await findFreePort(100, this.port, this._args));

            this.startAppiumServer(logLevel);
            response = await waitForOutput(this._server, /listener started/, /Error: listen/, 60000, true);
        }

        return response;
    }

    private startAppiumServer(logLevel) {
        this._server = child_process.spawn(this._appium, ["-p", this.port.toString(), "--log-level", logLevel], {
            shell: true,
            detached: false
        });
    }

    public async stop() {
        await this._deviceManager.stopDevice(this._args);
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
                if (isWin()) {
                    shutdown(this._server, this._args.verbose);
                    this._server.kill("SIGINT");
                    this._server.kill("SIGINT");
                    this._server = null;
                } else {
                    this._server.kill("SIGINT");
                    this._server.kill("SIGINT");
                    this._server.kill("SIGKILL");
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
            //const result = executeCommand("npm list -g");
            //if (result.includes("appium")) {
            log("Using global Appium binary.", true);
            log('Pleas make shure it is globally installed!', true);
            //} else if (result.includes("appium")) {
            //   const msg = "Appium not found. Please install appium before runnig tests!";
            //     log(msg, this._args.verbose);
            //     new Error(msg);
            // }
        }

        this._appium = appium;
    }
}