import { AppiumDriver } from "./appium-driver";
import { AppiumServer } from "./appium-server";

export class Session {
    private _port;

    constructor(private _appiumServer: AppiumServer, private _args, private _appiumDriver?: AppiumDriver) {
        this._port = this._appiumServer.port;
    }

    get port() {
        return this._port;
    }

    get runType() {
        return this._args.runType;
    }

    get appiumDriver() {
        return this._appiumDriver;
    }

    set appiumDriver(driver: AppiumDriver) {
        this._appiumDriver = driver;
    }

    get appiumServer() {
        return this._appiumServer;
    }
}