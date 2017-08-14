import { AppiumDriver } from './appium-driver';
import { ElementHelper } from './element-helper';
export * from "./appium-driver";
export declare function startServer(port?: number): Promise<any>;
export declare function stopServer(): Promise<void>;
export declare function createDriver(): AppiumDriver;
export declare function elementHelper(): ElementHelper;
