import { ChildProcess, spawn } from "child_process";
import {
    log,
    resolvePath,
    waitForOutput,
    shutdown,
    isWin,
    findFreePort,
    logWarn,
    logInfo,
    prepareApp,
    prepareDevice,
    getReportPath,
    ensureReportsDirExists,
    logError,
    checkImageLogType
} from "./utils";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDeviceManager } from "./interfaces/device-manager";
import { DeviceManager } from "./device-manager";
import { existsSync } from "fs";
import { killAllProcessAndRelatedCommand } from "mobile-devices-controller";
import { screencapture } from "./helpers/screenshot-manager";
import { LogImageType } from "./enums/log-image-type";

export class AppiumServer {
    private _server: ChildProcess;
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
        if (!this._args.isValidated && this._args.validateArgs) {
            await this._args.validateArgs();
            this._args.port = port;
        }
        this._args.deviceManager = deviceManager;
        if (this._args.isValidated && !this._args.attachToDebug && !this._args.sessionId) {
            await this.prepDevice(deviceManager);
            await this.prepApp();
        }
        if (this._args.isSauceLab) {
            logInfo(`SauceLab option is set to true. Skip starting of appium server!`)
            return this;
        }
        if (this._args.isKobiton) {
            logInfo(`Kobiton option is set to true. Skip starting of appium server!`)
            return this;
        }
        log("Starting server...", this._args.verbose);
        const logLevel = this._args.verbose === true ? "debug" : "info";
        this.port = this._args.port || port;

        if (!this._args.attachToDebug) {

            this.startAppiumServer(logLevel, this._args.isSauceLab);

            let response = await waitForOutput(this._server, /listener started/, /Error: listen/, 60000, this._args.verbose);

            let retries = 11;
            while (retries > 0 && !response) {
                if (retries < 5) {
                    killAllProcessAndRelatedCommand(this._port);
                }
                retries--;
                this.port += 10;
                this.port = (await findFreePort(100, this.port));

                this.startAppiumServer(logLevel, this._args.isSauceLab);
                response = await waitForOutput(this._server, /listener started/, /Error: listen/, 60000, true);
            }

            this.hasStarted = response;
            try {
                ensureReportsDirExists(this._args);
                if (checkImageLogType(this._args.testReporter, LogImageType.screenshots)) {
                    this._args.testReporterLog(`on_server_started`);
                    this._args.testReporterLog(screencapture(`${getReportPath(this._args)}/on_server_started.png`));
                }
            } catch (error) {
                logError(`Appium server is NOT started - ${error.message}`);
                if (checkImageLogType(this._args.testReporter, LogImageType.screenshots)) {
                    this._args.testReporterLog(`on_start_server_failure`);
                    this._args.testReporterLog(screencapture(`${getReportPath(this._args)}/on_start_server_failure.png`));
                }
            }
            return response;
        } else if (!this._args.attachToDebug) {
            return true;
        }

        return false;
    }

    private startAppiumServer(logLevel: string, isSauceLab: boolean) {
        const startingServerArgs: Array<string> = isSauceLab ? ["--log-level", logLevel] : ["-p", this.port.toString(), "--log-level", logLevel];
        if (this._args.isAndroid) {
            this._args.relaxedSecurity ? startingServerArgs.push("--relaxed-security") : console.log("'relaxedSecurity' is not enabled!\nTo enabled it use '--relaxedSecurity'!");
        }

        logInfo(`Server args: `, startingServerArgs);

        this._server = spawn(this._appium, startingServerArgs);
    }

    public async stop() {
        const onServerKilled = (server, signal, code, verbose) => {
            log(`Appium terminated due signal: ${signal} and code: ${code}`, verbose);
            server && server.removeAllListeners();
        }

        await this._args.deviceManager.stopDevice(this._args.device, this._args);
        return new Promise((resolve, reject) => {
            this._server.once("close", (code, signal) => {
                onServerKilled(this._server, signal, code, this._args.verbose);
                resolve();
            });

            this._server.once("exit", (code, signal) => {
                onServerKilled(this._server, signal, code, this._args.verbose);
                resolve();
            });

            this._server.once("error", (code, signal) => {
                onServerKilled(this._server, signal, code, this._args.verbose);
                resolve();
            });

            this._server.once("disconnect", (code, signal) => {
                onServerKilled(this._server, signal, code, this._args.verbose);
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
                    process.kill(this._server.pid, "SIGKILL");
                    shutdown(this._server, this._args.verbose);
                    try {
                        if (checkImageLogType(this._args.testReporter, LogImageType.screenshots)) {
                            this._args.testReporterLog(`on_server_stopped`);
                            this._args.testReporterLog(screencapture(`${getReportPath(this._args)}/on_server_stopped.png`));
                        }
                    } catch (error) { }
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
        const pluginAppiumBinary = resolvePath(pluginBinary, appium);
        const projectAppiumBinary = resolvePath(projectBinary, appium);

        if (existsSync(pluginAppiumBinary)) {
            logInfo("Using plugin-local Appium binary.", this._args.verbose);
            appium = pluginAppiumBinary;
        } else if (existsSync(projectAppiumBinary)) {
            logInfo("Using project-local Appium binary.", this._args.verbose);
            appium = projectAppiumBinary;
        } else {
            // TODO: find faster and reliable way to check if appium is installed globally
            //const result = executeCommand("npm list -g");
            // if (result.includes("appium")) {
            logWarn("Using global Appium binary.");
            //    console.log('Please, make sure it is installed globally.');
            //} else if (result.includes("appium")) {
            //    const msg = "Appium not found. Please install appium before running tests!";
            //    log(msg, this._args.verbose);
            //    new Error(msg);
            // }
        }

        this._appium = appium;
    }
}
