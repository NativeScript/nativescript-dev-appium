import { AppiumDriver } from './appium-driver';
import { ElementHelper } from './element-helper';
export * from "./appium-driver";
export declare function startServer(): Promise<{}>;
export declare function stopServer(): Promise<void> | Promise<{}>;
export declare function createDriver(): AppiumDriver;
export declare function elementHelper(): ElementHelper;
