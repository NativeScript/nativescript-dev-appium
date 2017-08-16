import { AppiumDriver } from './appium-driver';
import { ElementHelper } from './element-helper';
export * from "./appium-driver";
export * from "./search-options";
export declare function startServer(port?: number): Promise<{}>;
export declare function stopServer(): Promise<void | {}>;
export declare function createDriver(): AppiumDriver;
export declare function elementHelper(): ElementHelper;
