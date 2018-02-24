import { IDeviceManager } from "./lib/interfaces/device-manager";
import * as frameComparerHelper from "./lib/frame-comparer";
export { AppiumDriver } from "./lib/appium-driver";
export { AppiumServer } from "./lib/appium-server";
export { ElementHelper } from "./lib/element-helper";
export { UIElement } from "./lib/ui-element";
export { Point } from "./lib/point";
export { SearchOptions } from "./lib/search-options";
export { Locator } from "./lib/locators";
export { Direction } from "./lib/direction";
export { DeviceManger } from "./lib/device-controller";
export { FrameComparer } from "./lib/frame-comparer";
export { IRectangle } from "./lib/interfaces/rectangle";
export { IDeviceManager } from "./lib/interfaces/device-manager";
export declare function startServer(port?: number, deviceManager?: IDeviceManager): Promise<void>;
export declare function stopServer(): Promise<void>;
export declare function createDriver(): Promise<any>;
/**
 * Provide instance of FrameComparer in order to compare frames/ images from video
 * Please read carefully README.md before using it.
 * @throws exception in order the dependecies are not installed properly.
 */
export declare function loadFrameComparer(): frameComparerHelper.FrameComparer;
