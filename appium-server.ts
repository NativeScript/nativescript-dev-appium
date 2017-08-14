import * as child_process from "child_process";
import * as fs from "fs";
import * as utils from "./utils";

export class AppiumServer {
    private _appium;
    private _server;

    constructor(private _port: number) {
        this.resolveAppiumDependency();
    }

    get port() {
        utils.log("PORT: " + this._port)
        return this._port;
    }

    set port(port: number) {
        this._port = port;
    }

    get server() {
        return this._server;
    }

    public start() {
        utils.log("Starting server ...");
        this._server = child_process.spawn(this._appium, ["-p", this._port.toString()], {
            shell: true,
            detached: false
        });
        return utils.waitForOutput(this._server, /listener started/, 60000);
    }

    public stop() {
        utils.log("Stopping server ...");
        var isAlive = true;
        if (isAlive) {
            return new Promise((resolve, reject) => {
                this._server.on("close", (code, signal) => {
                    console.log(`Appium terminated due ${signal}`);
                    resolve();
                });
                // TODO: What about "error".
                this._server.kill('SIGINT');
                this._server = null;
            });
        } else {
            return Promise.resolve();
        }
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
