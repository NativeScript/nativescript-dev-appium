import * as child_process from "child_process";
import {
    log,
    resolve,
    waitForOutput,
    shutdown,
    fileExists,
    isWin,
    findFreePort,
    logWarn,
    logInfo,
    prepareApp,
    prepareDevice
} from "./utils";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDeviceManager } from "./interfaces/device-manager";
import { DeviceManager } from "./device-manager";

export class AppiumServer {
    private _server: child_process.ChildProcess;
    private _appium;
    private _port: number;
    private _runType: string;
    private _hasStarted: boolean;

    constructor(private _args: INsCapabilities) {
        this._runType = this._args.runType;
        this._hasStarted = false;
        this._port = _args.port;
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

    public async start(port, deviceManager: IDeviceManager = new DeviceManager()) {
        if(!this._args.isValidated){
            this._args.validateArgs();
            this._args.port = port;
        }
        this._args.deviceManager = deviceManager;
        if (!this._args.attachToDebug && !this._args.sessionId) {
            await this.prepDevice(deviceManager);
            await this.prepApp();
        }


        log("Starting server...", this._args.verbose);
        const logLevel = this._args.verbose === true ? "debug" : "info";
        this.port = this._args.port || port;
        let retry = false;

        if (!this._args.attachToDebug) {

            this.startAppiumServer(logLevel, this._args.isSauceLab);

            let response = await waitForOutput(this._server, /listener started/, /Error: listen/, 60000, this._args.verbose);

            let retries = 11;
            while (retries > 0 && !response) {
                retries--;
                this.port += 10;
                this.port = (await findFreePort(100, this.port));

                this.startAppiumServer(logLevel, this._args.isSauceLab);
                response = await waitForOutput(this._server, /listener started/, /Error: listen/, 60000, true);
            }

            return response;
        }
    }

    private startAppiumServer(logLevel: string, isSauceLab: boolean) {
        const startingServerArgs: Array<string> = isSauceLab ? ["--log-level", logLevel] : ["-p", this.port.toString(), "--log-level", logLevel];
        if (this._args.isAndroid && this._args.ignoreDeviceController && !this._args.isSauceLab) {
            this._args.relaxedSecurity ? startingServerArgs.push("--relaxed-security") : console.log("'relaxedSecurity' is not enabled!\nTo enabled it use '--relaxedSecurity'!");
        }

        logInfo(`Server args: `, startingServerArgs);

        this._server = child_process.spawn(this._appium, startingServerArgs, {
            shell: true,
            detached: false
        });
    }

    public async stop() {
        await this._args.deviceManager.stopDevice(this._args);
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

    private async prepDevice(deviceManager: IDeviceManager) {
        this._args = await prepareDevice(this._args, deviceManager);
    }

    private async prepApp() {
        this._args = await prepareApp(this._args);
    }

    // Resolve appium dependency
    private resolveAppiumDependency() {
        const projectDir = this._args.projectDir;
        const pluginBinary = this._args.pluginBinary;
        const projectBinary = this._args.projectBinary;
        const pluginRoot = this._args.pluginRoot;

        let appium = process.platform === "win32" ? "appium.cmd" : "appium";
        if (!this._args.attachToDebug && !this._args.sessionId) {
            this._appium = appium;
            return;
        }
        const pluginAppiumBinary = resolve(pluginBinary, appium);
        const projectAppiumBinary = resolve(projectBinary, appium);

        if (fileExists(pluginAppiumBinary)) {
            logInfo("Using plugin-local Appium binary.", this._args.verbose);
            appium = pluginAppiumBinary;
        } else if (fileExists(projectAppiumBinary)) {
            logInfo("Using project-local Appium binary.", this._args.verbose);
            appium = projectAppiumBinary;
        } else {
            //const result = executeCommand("npm list -g");
            //if (result.includes("appium")) {
            logWarn("Using global Appium binary.");
            console.log('Please, make sure it is installed globally.');
            //} else if (result.includes("appium")) {
            //   const msg = "Appium not found. Please install appium before runnig tests!";
            //     log(msg, this._args.verbose);
            //     new Error(msg);
            // }
        }

        this._appium = appium;
    }
}
