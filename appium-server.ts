import * as child_process from "child_process";
import * as fs from "fs";
import * as utils from "./utils";
import * as path from "path";

export class AppiumServer {
    private _appium;
    private _server: child_process.ChildProcess;
    private _port: number;
    private _runType: string;

    constructor() {
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

    public async start() {
        utils.log("Starting server...");
        this._server = child_process.spawn(this._appium, ["-p", this._port.toString()], {
            shell: true,
            detached: false
        });

        const responce: boolean = await utils.waitForOutput(this._server, /listener started/, 60000);

        if (!responce) {
            throw new Error("Timeout expired. Appium server did't start correctly!")
        }

        return responce;
    }

    public stop() {
        return new Promise((resolve, reject) => {
            this._server.on("close", (code, signal) => {
                utils.log(`Appium terminated due signal: ${signal} and code: ${code}`);
                resolve();
            })
            utils.log("Stopping server...");
            this._server.kill("SIGINT");
            try {
                this._server.kill();
            } catch (error) {
                console.log(error);
            }
        });
    }

    // Resolve appium dependency
    private resolveAppiumDependency() {
        const projectDir = utils.projectDir();
        const pluginBinary = utils.pluginBinary();
        const projectBinary = utils.projectBinary();
        const pluginRoot = utils.pluginRoot();

        let appium = process.platform === "win32" ? "appium.cmd" : "appium";
        const pluginAppiumBinary = utils.resolve(pluginBinary, appium);
        const projectAppiumBinary = utils.resolve(projectBinary, appium);

        if (fs.existsSync(pluginAppiumBinary)) {
            utils.log("Using plugin-local Appium binary.");
            appium = pluginAppiumBinary;
        } else if (fs.existsSync(projectAppiumBinary)) {
            utils.log("Using project-local Appium binary.");
            appium = projectAppiumBinary;
        } else {
            utils.log("Using global Appium binary.");
        }

        this._appium = appium;
    }
}