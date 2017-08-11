import * as child_process from "child_process";
import * as fs from "fs";
import * as utils from "./utils";

export class AppiumServer {
    private _appium;
    private _server;
    constructor(private _port: number) {
        this.resolveAppiumDependency();
    }

    // This is need to be passed to appium driver
    get port() {
        utils.log("PORT " + this._port)
        return this._port;
    }

    set port(port: number) {
        this._port = port;
    }

    // This is for the process
    get server() {
        return this._server;
    }

    public start() { }

    public stop() { }

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

// TODO Move in AppiumServer class
let server;

export function startAppiumServer(port) {
    // Here should be used this.appium / this.port
    server = child_process.spawn("appium", ["-p", port], {
        shell: true,
        detached: false
    });
    return utils.waitForOutput(server, /listener started/, 60000);
}

export function stopAppiumServer(port) {
    // todo: check if allready dead?
    var isAlive = true;
    if (isAlive) {
        return new Promise((resolve, reject) => {
            server.on("close", (code, signal) => {
                console.log(`Appium terminated due ${signal}`);
                resolve();
            });
            // TODO: What about "error".
            server.kill('SIGINT');
            server = null;
        });
    } else {
        return Promise.resolve();
    }
}

