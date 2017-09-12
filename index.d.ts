export { AppiumDriver } from "./lib/appium-driver";
export { ElementHelper } from "./lib/element-helper";
export { UIElement } from "./lib/ui-element";
export { Point } from "./lib/point";
export { SearchOptions } from "./lib/search-options";
export { Direction } from "./lib/direction";
export declare function startServer(port?: number): Promise<void>;
export declare function stopServer(): Promise<void>;
export declare function createDriver(): Promise<any>;
