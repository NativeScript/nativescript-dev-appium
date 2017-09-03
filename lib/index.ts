import * as portastic from "portastic";
import { AppiumServer } from './appium-server';
import { createAppiumDriver } from './appium-driver';
import { AppiumDriver } from './appium-driver';
import { ElementHelper } from './element-helper';
import { NsCapabilities } from './ns-capabilities';

export { AppiumDriver } from "./appium-driver";
export { ElementHelper } from "./element-helper";
export { UIElement } from "./ui-element";
export { Point } from "./point";
export { SearchOptions } from "./search-options";

const nsCapabilities = new NsCapabilities();
const server = new AppiumServer(nsCapabilities);
export async function startServer(port?: number) {
    server.port = port || nsCapabilities.port;
    if (!port) {
        server.port = (await portastic.find({ min: 8600, max: 9080 }))[0];
    }
    return await server.start();
};

export async function stopServer() {
    return await server.stop();
};

export function createDriver() {
    if (!nsCapabilities.appiumCapsLocation) {
        throw new Error("Provided path to appium capabilities is not correct!");
    }
    if (!nsCapabilities.runType) {
        throw new Error("--runType is missing! Make sure it is provided correctly! It is used to parse the configuration for appium driver!");
    }
    return createAppiumDriver(server.port, nsCapabilities);
};

export function elementHelper(): ElementHelper {
    return new ElementHelper(this.caps.platformName.toLowerCase(), this.caps.platformVersion.toLowerCase());
}