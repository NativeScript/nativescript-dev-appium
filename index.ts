import * as portastic from "portastic";
import { AppiumServer } from "./lib/appium-server";
import { createAppiumDriver } from "./lib/appium-driver";
import { AppiumDriver } from "./lib/appium-driver";
import { ElementHelper } from "./lib/element-helper";
import { NsCapabilities } from "./lib/ns-capabilities";
import { Session } from "./lib/session";
import { TestManager } from "./lib/test-manager";

export { AppiumDriver } from "./lib/appium-driver";
export { ElementHelper } from "./lib/element-helper";
export { UIElement } from "./lib/ui-element";
export { Point } from "./lib/point";
export { SearchOptions } from "./lib/search-options";

const nsCapabilities = new NsCapabilities();
const server = new AppiumServer(nsCapabilities);
export async function startServer(port?: number) {
    server.port = port || nsCapabilities.port;
    if (!server.port) {
        server.port = (await portastic.find({ min: 8600, max: 9080 }))[0];
    }

    const session = new Session(server, nsCapabilities, null);
    const startedServer = await server.start();
    TestManager.addSession(session);
};

export async function stopServer() {
    TestManager.removeSession(server.port);
    return await server.stop();
};

export async function createDriver() {
    if (!nsCapabilities.appiumCapsLocation) {
        throw new Error("Provided path to appium capabilities is not correct!");
    }
    if (!nsCapabilities.runType) {
        throw new Error("--runType is missing! Make sure it is provided correctly! It is used to parse the configuration for appium driver!");
    }
    let appiumDriver = TestManager.getSession(server.port).appiumDriver;
    if (appiumDriver !== null && appiumDriver.isAlive) {
        return appiumDriver;
    } else {
        appiumDriver = await createAppiumDriver(server.port, nsCapabilities);
        TestManager.getSession(server.port).appiumDriver = appiumDriver;
    }

    return await TestManager.getSession(server.port).appiumDriver;
};