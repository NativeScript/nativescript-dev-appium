import { AppiumDriver } from "./appium-driver";
import { AppiumServer } from "./appium-server";
export declare class Session {
    private _appiumServer;
    private _args;
    private _appiumDriver;
    private _port;
    constructor(_appiumServer: AppiumServer, _args: any, _appiumDriver?: AppiumDriver);
    readonly port: any;
    readonly runType: any;
    appiumDriver: AppiumDriver;
    readonly appiumServer: AppiumServer;
}
