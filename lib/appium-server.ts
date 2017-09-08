import * as child_process from "child_process";
import { log, resolve, waitForOutput, shutdown, fileExists } from "./utils";
import { INsCapabilities } from "./ins-capabilities";

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
        log("Starting server...", this._args.verbose);
        this._server = child_process.spawn(this._appium, ["-p", this.port.toString(), "--log-level", "debug"], {
            shell: true,
            detached: false
        });

        const responce: boolean = await waitForOutput(this._server, /listener started/, /Error: listen/, 60000, this._args.verbose);

        return responce;
    }

    public stop() {
        return new Promise((resolve, reject) => {
            this._server.on("close", (code, signal) => {
                log(`Appium terminated due signal: ${signal} and code: ${code}`, this._args.verbose);
                resolve();
            });

            this._server.on("exit", (code, signal) => {
                log(`Appium terminated due signal: ${signal} and code: ${code}`, this._args.verbose);
                resolve();
            });

            log("Stopping server...", this._args.verbose);
            try {
                this._server.kill("SIGINT");
                shutdown(this._server, this._args.verbose);
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
            log("Using global Appium binary.", this._args.verbose);
        }

        this._appium = appium;
    }
}