import { execSync } from "child_process";
import { NsCapabilities } from "../ns-capabilities";
import { AppiumServer } from "../appium-server";
import { AppiumDriver } from "../appium-driver";
import { isWin, logInfo, logError, stopServerCommand } from "../utils";
import * as parser from "../parser"
import { INsCapabilities } from "../interfaces/ns-capabilities";

export const nsCapabilities: INsCapabilities = new NsCapabilities(parser);
let server: AppiumServer;
const startSession = async () => {
    if (!isWin()) {
        execSync(stopServerCommand(nsCapabilities.port));
        console.log(stopServerCommand(nsCapabilities.port));
    }

    nsCapabilities.validateArgs();
    nsCapabilities.appiumCaps = nsCapabilities.appiumCaps || {};
    nsCapabilities.appiumCaps["newCommandTimeout"] = 300;
    server = new AppiumServer(nsCapabilities);
    await server.start(nsCapabilities.port);
    const driver = await AppiumDriver.createAppiumDriver(nsCapabilities);
    const session = await driver.sessionId();
    logInfo(`port: ${nsCapabilities.port}`);
    logInfo(`session id: ${session}`);
}

startSession().then(s => {
    logInfo("session started")
});

process.once("uncaughtException", async () => {
    logError(`uncaughtException!`)
})

process.once("SIGINT", async () => {
    if (!isWin()) {
        console.log(`stop server!`)
        execSync(stopServerCommand(nsCapabilities.port));
    }
    await server.stop();
})