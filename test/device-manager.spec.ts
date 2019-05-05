import { DeviceManager } from "../lib/device-manager";
import { NsCapabilities } from "../lib/ns-capabilities";
import {
    DeviceController,
    Platform,
    Status,
    DeviceType,
    AndroidController,
    IOSController
} from "mobile-devices-controller";
import { assert } from "chai";
import { nsCapabilities } from "../index";
import { AppiumServer } from "../lib/appium-server";
import { AppiumDriver } from "../lib/appium-driver";
import { resolveCapabilities } from "../lib/capabilities-helper";
import { INsCapabilities } from "lib/interfaces/ns-capabilities";
import { INsCapabilitiesArgs } from "lib/interfaces/ns-capabilities-args";
import { existsSync, mkdirSync, copyFileSync } from "fs";
import { execSync } from "child_process";

const outDir = `${process.cwd()}/test/out`;
const androidApp = `${outDir}/template-hello-world-ts-release.apk`;
const iosApp = `${outDir}/template-hello-world-ts.app`;
const remoteStorage = "/tns-dist";

// For local run
// if (!existsSync(outDir)) {
//     mkdirSync(outDir);
// }

// if (!existsSync(`${outDir}/template-hello-world-ts-release.apk`)) {
//     execSync(`cp ${remoteStorage}/TestApps/Stable/Android/template-hello-world-ts-release.apk ${outDir}`);
// }

// if (!existsSync(`${outDir}/vue-cli-template-simple-release.apk`)) {
//     execSync(`cp ${remoteStorage}/TestApps/Stable/Android/vue-cli-template-simple-release.apk ${outDir}`);
// }

// if (!existsSync(`${outDir}/template-hello-world-ts.app`)) {
//     execSync(`cp ${remoteStorage}/TestApps/Stable/iOS/template-hello-world-ts.tgz ${outDir}`);
//     execSync("tar xf template-hello-world-ts.tgz", { cwd: outDir });
// }

describe("android-devices", () => {
    let deviceManager: DeviceManager;
    const appiumArgs: INsCapabilities = nsCapabilities;

    before("Init: DeviceManager", () => {
        DeviceController.killAll(DeviceType.EMULATOR);
        deviceManager = new DeviceManager();
        appiumArgs.extend(<any>{ appiumCaps: { platformName: Platform.ANDROID, fullReset: false } });
    });

    after("Kill all emulators", () => {
        DeviceController.killAll(DeviceType.EMULATOR);
    })

    it("Start emulator", async () => {
        const device = await deviceManager.startDevice(appiumArgs);
        let foundBootedDevices = await DeviceController.getDevices({ platform: Platform.ANDROID, status: Status.BOOTED });
        assert.isTrue(foundBootedDevices.some(d => d.token === device.token));
        await deviceManager.stopDevice(device, appiumArgs);
        foundBootedDevices = await DeviceController.getDevices({ platform: Platform.ANDROID, status: Status.BOOTED });
        assert.isTrue(!foundBootedDevices.some(d => d.token === device.token));
    });

    it("Start emulator when already started", async () => {
        appiumArgs.extend(<any>{ appiumCaps: { platformName: Platform.ANDROID, fullReset: true } });
        const device = await deviceManager.startDevice(appiumArgs);
        let foundBootedDevices = await DeviceController.getDevices({ platform: Platform.ANDROID, status: Status.BOOTED });
        assert.isTrue(foundBootedDevices.some(d => d.token === device.token));
        await deviceManager.stopDevice(device, appiumArgs);
        foundBootedDevices = await DeviceController.getDevices({ platform: Platform.ANDROID, status: Status.BOOTED, token: device.token });
        assert.isTrue(!foundBootedDevices || foundBootedDevices.length === 0);
    });
});

describe("ios-devices", () => {
    let deviceManager: DeviceManager;
    let appiumArgs: NsCapabilities;

    before("Init: DeviceManager", () => {
        deviceManager = new DeviceManager();
        appiumArgs = new NsCapabilities(<any>{});
        appiumArgs.extend(<any>{ appiumCaps: { platformName: Platform.IOS, fullReset: false, deviceName: /iPhone X/ } })
        appiumArgs.shouldSetFullResetOption();
    });

    after("Kill all simulators", () => {
        DeviceController.killAll(DeviceType.SIMULATOR);
    })

    it("Start simulator fullReset: false, should not kill device", async () => {
        const device = await deviceManager.startDevice(appiumArgs);
        let foundBootedDevices = await DeviceController.getDevices({ platform: Platform.IOS, status: Status.BOOTED });
        assert.isTrue(foundBootedDevices.some(d => d.token === device.token));
        await deviceManager.stopDevice(device, appiumArgs);
        foundBootedDevices = await DeviceController.getDevices({ platform: Platform.IOS, status: Status.BOOTED });
        assert.isTrue(foundBootedDevices.some(d => d.token === device.token));
    });

    it("Start simulator fullReset: true, should kill device", async () => {
        appiumArgs.extend(<any>{ appiumCaps: { platformName: Platform.IOS, fullReset: true, deviceName: /iPhone X/ } });
        appiumArgs.shouldSetFullResetOption();
        const device = await deviceManager.startDevice(appiumArgs);
        let foundBootedDevices = await DeviceController.getDevices({ platform: Platform.IOS, status: Status.BOOTED });
        assert.isTrue(foundBootedDevices.some(d => d.token === device.token));
        await deviceManager.stopDevice(device, appiumArgs);
        foundBootedDevices = await DeviceController.getDevices({ platform: Platform.IOS, status: Status.BOOTED, token: device.token });
        assert.isTrue(!foundBootedDevices || foundBootedDevices.length === 0);
    });
});

describe("find-capabilities", async () => {
    const caps: any = resolveCapabilities("../samples", "android23", ".", "appium.capabilities.json");
    assert.isTrue(caps.deviceName === "Emulator-Api23-Default");
})

describe("start-appium-server-android", async () => {

    before("Init capabilities", () => {
    });

    after("after all ", async () => {
        DeviceController.killAll(DeviceType.EMULATOR);
    })

    it("Start server", async () => {
        const nsCaps = new NsCapabilities({
            port: 8799,
            appPath: androidApp,
            appiumCaps: {
                platformName: Platform.ANDROID,
                fullReset: false
            },
        });
        const server: AppiumServer = new AppiumServer(nsCaps);
        await server.start(nsCaps.port);
        assert.isTrue(server.hasStarted);
        await server.stop();
        const startTime = Date.now();
        while (!server.server.killed && Date.now() - startTime < 5000) { }
        assert.isTrue(server.server.killed, "Process is not killed");
    });

    it("Start appium driver", async () => {
        const nsCaps = new NsCapabilities({
            appPath: androidApp,
            testReports: `${process.cwd()}/test`,
            port: 9900,
            appiumCaps: {
                platformName: Platform.ANDROID,
                fullReset: true
            },
        });
        const server: AppiumServer = new AppiumServer(nsCaps);
        await server.start(nsCaps.port);
        assert.isTrue(server.hasStarted);
        const driver = await AppiumDriver.createAppiumDriver(nsCaps);
        let currentWindowName = AndroidController.getCurrentFocusedScreen(nsCaps.device);
        const startTime = Date.now();
        while (!currentWindowName.includes("com.tns.NativeScriptActivity") && Date.now() - startTime < 5000) { 
            console.log(currentWindowName);
            currentWindowName = AndroidController.getCurrentFocusedScreen(nsCaps.device); 
        }

        assert.isTrue(currentWindowName.includes("com.tns.NativeScriptActivity"), `Focused screen doesn't include activity ${currentWindowName}!`);
        await driver.quit();
        await server.stop();
    });

});

describe("start-appium-server-ios", async () => {

    before("Init capabilities", () => {
    });

    after("after all ", async () => {
        await IOSController.killAll();
    })

    it("Start server", async () => {
        const nsCaps = new NsCapabilities({
            appPath: iosApp,
            port: 8799,
            appiumCaps: {
                platformName: Platform.IOS,
                deviceName: /^iPhone 6$/,
                platformVersion: "11.2",
                fullReset: false
            },
        });
        const server: AppiumServer = new AppiumServer(nsCaps);
        await server.start(nsCaps.port);
        assert.isTrue(server.hasStarted);
        await server.stop();
        const startTime = Date.now();
        while (!server.server.killed && Date.now() - startTime < 5000) { }
        assert.isTrue(server.server.killed, "Process is not killed");
    });

    it("Start appium driver", async () => {
        const nsCaps = new NsCapabilities({
            port: 8822,
            appPath: iosApp,
            appiumCaps: {
                platformName: Platform.IOS,
                deviceName: /^iPhone XR$/,
                platformVersion: /12/,
                fullReset: true
            },
            verbose: false
        });
        const server: AppiumServer = new AppiumServer(nsCaps);
        await server.start(nsCaps.port);
        assert.isTrue(server.hasStarted);
        const driver = await AppiumDriver.createAppiumDriver(nsCaps);
        await driver.quit();
        await server.stop();
    });
});

describe("start-device-by-apiLevel", async () => {
    it("test-start-emulator-apiLevel-6.0", async () => {
        const nsCaps = new NsCapabilities({
            port: 8799,
            runType: "android23",
            appPath: androidApp,
            appiumCaps: {
                platformVersion: "6.0",
                platformName: Platform.ANDROID,
                fullReset: true
            }
        });

        const server = new AppiumServer(nsCaps);
        await server.start(nsCaps.port);
        const driver = await AppiumDriver.createAppiumDriver(nsCaps);
        const currentWindowName = AndroidController.getCurrentFocusedScreen(nsCaps.device);
        const startTime = Date.now();
        while (!currentWindowName.includes("com.tns.NativeScriptActivity") && Date.now() - startTime < 5000) { }
        assert.isTrue(currentWindowName.includes("com.tns.NativeScriptActivity"), `Focused screen doesn't include activity ${currentWindowName}!`);
        await driver.quit();
        await server.stop();
    });

    it("test-start-simulator-apiLevel-12.", async () => {
        const nsCaps = new NsCapabilities({
            appPath: iosApp,
            port: 8887,
            appiumCaps: {
                platformVersion: /12.||11./,
                platformName: Platform.IOS,
                fullReset: true
            }
        });

        const server = new AppiumServer(nsCaps);
        await server.start(nsCaps.port);
        const driver = await AppiumDriver.createAppiumDriver(nsCaps);

        const apps = IOSController.getInstalledApps(nsCaps.device);

        const isInstalled = apps.some(app => app.includes(nsCaps.appiumCaps.bundleId));
        assert.isTrue(isInstalled);
        await driver.quit();
        await server.stop();
    });
});

describe("dev-mode-options", async () => {
    let appiumServer: AppiumServer;
    const port = 8399;

    before("start devices", async () => {
        await DeviceController.startDevice({ platform: Platform.ANDROID, apiLevel: "23" });
        await DeviceController.startDevice({ platform: Platform.IOS, apiLevel: <any>/12./, name: "iPhone XR" });
        appiumServer = new AppiumServer({});
        await appiumServer.start(8399);
    });

    after("kill server", async () => {
        await DeviceController.killAll(DeviceType.EMULATOR);
        await DeviceController.killAll(DeviceType.SIMULATOR);
        await appiumServer.stop();
    })

    it("test ios", async () => {
        const nsCaps = new NsCapabilities(<INsCapabilitiesArgs>{
            deviceTypeOrPlatform: Platform.IOS,
            appPath: iosApp,
            port: port,
            verbose: true
        });

        const appiumDriver = await AppiumDriver.createAppiumDriver(nsCaps);
        assert.isTrue(appiumDriver.nsCapabilities.device.platform === Platform.IOS);
        assert.isDefined(appiumDriver.nsCapabilities.appiumCaps.app);
        await appiumDriver.quit();
    });
    it("test android", async () => {
        const nsCaps = new NsCapabilities(<INsCapabilitiesArgs>{
            deviceTypeOrPlatform: Platform.ANDROID,
            appPath: androidApp,
            port: port,
        });

        const appiumDriver = await AppiumDriver.createAppiumDriver(nsCaps);
        assert.isTrue(appiumDriver.nsCapabilities.device.platform === Platform.ANDROID);
        assert.isDefined(appiumDriver.nsCapabilities.appiumCaps.app);
        await appiumDriver.quit();
    });
    it("test --device.platform=android", async () => {
        const nsCaps = new NsCapabilities(<INsCapabilitiesArgs>{
            device: { platform: Platform.ANDROID },
            appPath: androidApp,
            port: port
        });

        const appiumDriver = await AppiumDriver.createAppiumDriver(nsCaps);
        assert.isTrue(appiumDriver.nsCapabilities.device.platform === Platform.ANDROID);
        assert.isDefined(appiumDriver.nsCapabilities.appiumCaps.app);
        await appiumDriver.quit();
    });
    it("test --device.platform=ios", async () => {
        const nsCaps = new NsCapabilities(<INsCapabilitiesArgs>{
            device: { platform: Platform.IOS },
            appPath: iosApp,
            port: port
        });

        const appiumDriver = await AppiumDriver.createAppiumDriver(nsCaps);
        assert.isTrue(appiumDriver.nsCapabilities.device.platform === Platform.IOS);
        assert.isDefined(appiumDriver.nsCapabilities.appiumCaps.app);
        await appiumDriver.quit();
    });
})