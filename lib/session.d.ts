import { AppiumDriver } from "./appium-driver";
import { AppiumServer } from "./appium-server";
export declare class Session {
    private _args;
    private _appiumDriver;
    private _appiumServer;
    constructor(_args: any, _appiumDriver: AppiumDriver, _appiumServer: AppiumServer);
    readonly runType: any;
    readonly appiumDriver: AppiumDriver;
    readonly appiumServer: AppiumServer;
}
