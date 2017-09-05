import * as portastic from "portastic";
import { AppiumServer } from './lib/appium-server';
import { createAppiumDriver } from './lib/appium-driver';
import { AppiumDriver } from './lib/appium-driver';
import { ElementHelper } from './lib/element-helper';
import { NsCapabilities } from './lib/ns-capabilities';

export { AppiumDriver } from "./lib/appium-driver";
export { ElementHelper } from "./lib/element-helper";
export { UIElement } from "./lib/ui-element";
export { Point } from "./lib/point";
export { SearchOptions } from "./lib/search-options";

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
    return new ElementHelper(nsCapabilities.appiumCaps.platformName.toLowerCase(), nsCapabilities.appiumCaps.platformVersion.toLowerCase());
}