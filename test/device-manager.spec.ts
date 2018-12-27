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
import { startServer, nsCapabilities, createDriver } from "../index";
import { AppiumServer } from "../lib/appium-server";
import { AppiumDriver } from "../lib/appium-driver";
import { resolveCapabilities } from "../lib/capabilities-helper";
import { INsCapabilities } from "lib/interfaces/ns-capabilities";

const androidApp = "~/git/out/QSF-release.apk";
const iosApp = "/Users/tsenov/git/nativescript-sdk-examples-ng/platforms/ios/build/emulator/nativescriptsdkexamplesng.app";

describe("android devices", () => {
    let deviceManager: DeviceManager;
    const appiumArgs: INsCapabilities = nsCapabilities;

    before("Init: DeviceManager", () => {
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
        assert.isTrue(foundBootedDevices.some(d => d.token === device.token));
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

describe("ios devices", () => {
    let deviceManager: DeviceManager;
    let appiumArgs: NsCapabilities;

    before("Init: DeviceManager", () => {
        deviceManager = new DeviceManager();
        appiumArgs = new NsCapabilities(<any>{});
        appiumArgs.extend(<any>{ appiumCaps: { platformName: Platform.IOS, fullReset: false } })
        appiumArgs.shouldSetFullResetOption();
    });

    after("Kill all simulators", () => {
        DeviceController.killAll(DeviceType.SIMULATOR);
    })

    it("Start simulator fullReset: false", async () => {
        const device = await deviceManager.startDevice(appiumArgs);
        let foundBootedDevices = await DeviceController.getDevices({ platform: Platform.IOS, status: Status.BOOTED });
        assert.isTrue(foundBootedDevices.some(d => d.token === device.token));
        await deviceManager.stopDevice(device, appiumArgs);
        foundBootedDevices = await DeviceController.getDevices({ platform: Platform.IOS, status: Status.BOOTED });
        assert.isTrue(foundBootedDevices.some(d => d.token === device.token));
    });

    it("Start simulator fullReset", async () => {
        appiumArgs.extend(<any>{ appiumCaps: { platformName: Platform.IOS, fullReset: true } });
        appiumArgs.shouldSetFullResetOption();
        const device = await deviceManager.startDevice(appiumArgs);
        let foundBootedDevices = await DeviceController.getDevices({ platform: Platform.IOS, status: Status.BOOTED });
        assert.isTrue(foundBootedDevices.some(d => d.token === device.token));
        await deviceManager.stopDevice(device, appiumArgs);
        foundBootedDevices = await DeviceController.getDevices({ platform: Platform.IOS, status: Status.BOOTED, token: device.token });
        assert.isTrue(!foundBootedDevices || foundBootedDevices.length === 0);
    });
});

describe("find capabilities", async () => {
    const caps: any = resolveCapabilities("../samples", "android23", ".", "appium.capabilities.json");
    assert.isTrue(caps.deviceName === "Emulator-Api23-Default");
})

describe("start Appium server android", async () => {

    before("Init capabilities", () => {
    });

    after("after all ", async () => {
        DeviceController.killAll(DeviceType.EMULATOR);
    })

    it("Start server", async () => {
        const nsCaps = new NsCapabilities({
            appPath: androidApp,
            appiumCaps: {
                platformName: Platform.ANDROID,
                fullReset: false
            },
        });
        const server: AppiumServer = new AppiumServer(nsCaps);
        await server.start(8799);
        assert.isTrue(server.hasStarted);
        await server.stop();
        const startTime = Date.now();
        while (!server.server.killed && Date.now() - startTime < 5000) { }
        assert.isTrue(server.server.killed, "Process is not killed");
    });

    it("Start appium driver", async () => {
        const nsCaps = new NsCapabilities({
            appPath: androidApp,
            appiumCaps: {
                platformName: Platform.ANDROID,
                fullReset: true
            },
        });
        const server: AppiumServer = new AppiumServer(nsCaps);
        await server.start(9900);
        assert.isTrue(server.hasStarted);
        const driver = await AppiumDriver.createAppiumDriver(server.port, nsCaps);
        const currentWindowName = AndroidController.getCurrentFocusedScreen(nsCaps.device);
        const startTime = Date.now();
        while (!currentWindowName.includes("com.tns.NativeScriptActivity") && Date.now() - startTime < 5000) { }

        assert.isTrue(currentWindowName.includes("com.tns.NativeScriptActivity"), `Focused screen doesn't include activity ${currentWindowName}!`);
        await driver.quit();
        await server.stop();
    });

});

describe("start Appium server ios", async () => {

    before("Init capabilities", () => {
    });

    after("after all ", async () => {
        await IOSController.killAll();
    })

    it("Start server", async () => {
        const nsCaps = new NsCapabilities({
            appPath: iosApp,
            appiumCaps: {
                platformName: Platform.IOS,
                deviceName: "^iPhone 6$",
                platformVersion: "11.2",
                fullReset: false
            },
        });
        const server: AppiumServer = new AppiumServer(nsCaps);
        await server.start(8799);
        assert.isTrue(server.hasStarted);
        await server.stop();
        const startTime = Date.now();
        while (!server.server.killed && Date.now() - startTime < 5000) { }
        assert.isTrue(server.server.killed, "Process is not killed");
    });

    it("Start appium driver", async () => {
        const nsCaps = new NsCapabilities({
            appPath: iosApp,
            appiumCaps: {
                platformName: Platform.IOS,
                deviceName: "^iPhone XR$",
                platformVersion: "12",
                fullReset: true
            },
            verbose: false
        });
        const server: AppiumServer = new AppiumServer(nsCaps);
        await server.start(9900);
        assert.isTrue(server.hasStarted);
        const driver = await AppiumDriver.createAppiumDriver(server.port, nsCaps);
        await driver.quit();
        await server.stop();
    });
});


describe("Start device by apiLevel", async () => {
    it("test-start-emulator-apiLevel-6.0", async () => {
        const nsCaps = nsCapabilities;
        nsCaps.runType = "android23";
        nsCaps.appPath = androidApp;

        nsCaps.appiumCaps = {
            platformVersion: "6.0",
            platformName: Platform.ANDROID,
            fullReset: true
        };

        const server = await startServer();
        const driver = await createDriver();

        const currentWindowName = AndroidController.getCurrentFocusedScreen(nsCaps.device);
        const startTime = Date.now();
        while (!currentWindowName.includes("com.tns.NativeScriptActivity") && Date.now() - startTime < 5000) { }
        assert.isTrue(currentWindowName.includes("com.tns.NativeScriptActivity"), `Focused screen doesn't include activity ${currentWindowName}!`);
        await driver.quit();
        await server.stop();
    });

    it("test-start-simulator-apiLevel-12.", async () => {
        const nsCaps = nsCapabilities;
        nsCaps.runType = "android23";
        nsCaps.appPath = iosApp,

            nsCaps.appiumCaps = {
                platformVersion: "12.",
                platformName: Platform.IOS,
                fullReset: true
            };

        const server = await startServer();
        const driver = await createDriver();

        const apps = IOSController.getInstalledApps(nsCaps.device);

        const isInstalled = apps.some(app => app.includes(nsCaps.appiumCaps.bundleId));
        assert.isTrue(isInstalled);
        await driver.quit();
        await server.stop();
    });
});