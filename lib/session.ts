import { AppiumDriver } from "./appium-driver";
import { AppiumServer } from "./appium-server";

export class Session {
    constructor(private _args, private _appiumDriver: AppiumDriver, private _appiumServer: AppiumServer) {
    }

    get runType() {
        return this._args.runType;
    }

    get appiumDriver() {
        return this._appiumDriver;
    }

    get appiumServer() {
        return this._appiumServer;
    }
}