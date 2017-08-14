import * as child_process from "child_process";
import * as fs from "fs";
import * as utils from "./utils";
import * as path from "path";

export class AppiumServer {
    private _appium;
    private _server;
    private _port: number;

    constructor() {
        this.resolveAppiumDependency();
    }

    get port() {
        return this._port;
    }

    set port(port: number) {
        this._port = port;
    }

    get server() {
        return this._server;
    }

    public async start() {
        this._server = await require(this._appium).main({ "port": this._port });

        return this._server;
    }

    public async stop() {
        await this._server.close();
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
            appium = utils.executeCommand("which appium");
            utils.log("Using global Appium binary. " + appium);
        }

        this._appium = appium;
    }
}
