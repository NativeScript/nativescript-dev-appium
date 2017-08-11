import { AppiumDriver } from './appium-driver';
import { ElementHelper } from './element-helper';
export * from "./appium-driver";
export declare function startAppiumServer(port: any): Promise<{}>;
export declare function killAppiumServer(): Promise<void> | Promise<{}>;
export declare function createDriver(): AppiumDriver;
export declare function elementHelper(): ElementHelper;
