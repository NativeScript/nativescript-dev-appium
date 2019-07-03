import * as wd from "wd";
import * as webdriverio from "webdriverio";
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
export const should = chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

import { ElementHelper } from "./element-helper";
import { SearchOptions } from "./search-options";
import { UIElement } from "./ui-element";
import { Direction } from "./direction";
import { Locator } from "./locators";
import {
    Platform,
    DeviceController,
    IDevice,
    DeviceType,
    AndroidController
} from "mobile-devices-controller";
import {
    addExt,
    log,
    resolvePath,
    scroll,
    findFreePort,
    wait,
    getSessions,
    getSession,
    logError,
    prepareApp,
    logInfo,
    prepareDevice,
    getStorage,
    encodeImageToBase64,
    ensureReportsDirExists,
    checkImageLogType
} from "./utils";

import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IRectangle } from "./interfaces/rectangle";
import { Point } from "./point";
import { ImageHelper } from "./image-helper";
import { ImageOptions } from "./image-options"
import { writeFileSync, existsSync } from "fs";
import { DeviceManager } from "../lib/device-manager";
import { extname, join } from "path";
import { LogType } from "./log-types";
import { screencapture } from "./helpers/screenshot-manager";
import { LogImageType } from "./enums/log-image-type";
import { DeviceOrientaion } from "./enums/device-orientatioin";

export class AppiumDriver {
    private _defaultWaitTime: number = 5000;
    private _elementHelper: ElementHelper;
    private _imageHelper: ImageHelper;
    private _isAlive: boolean = false;
    private _locators: Locator;
    private _storageByPlatform: string;

    private constructor(private _driver: any, private _wd, private _webio: any, private _driverConfig, private _args: INsCapabilities) {
        this._elementHelper = new ElementHelper(this._args);
        this._imageHelper = new ImageHelper(this._args, this);
        this._isAlive = true;
        this._locators = new Locator(this._args);
        this._webio.requestHandler.sessionID = this._driver.sessionID;
    }

    get imageHelper() {
        return this._imageHelper;
    }

    get defaultWaitTime(): number {
        return this._defaultWaitTime;
    }

    set defaultWaitTime(waitTime: number) {
        this._defaultWaitTime = waitTime;
    }

    get capabilities() {
        return this._args.appiumCaps;
    }

    get nsCapabilities(): INsCapabilities {
        return this._args;
    }

    get platformName() {
        return this._args.appiumCaps.platformName;
    }

    get platformVersion() {
        return this._args.appiumCaps.platformVersion;
    }

    get elementHelper() {
        return this._elementHelper;
    }

    get locators() {
        return this._locators;
    }

    get isAlive() {
        return this._isAlive;
    }

    get isAndroid() {
        return this._args.isAndroid;
    }

    get isIOS() {
        return this._args.isIOS;
    }

    get driver() {
        return this._driver;
    }

    /**
    * Get the storage where test results from image comparison is logged It will be reports/app nam/device name
    */
    get reportsPath() {
        return this._args.reportsPath;
    }

    /**
    * Get the storage where images are captured by platform. It will be resources/app nam/platform name
    */
    get storageByPlatform() {
        return this._storageByPlatform;
    }

    /**
     * Get the storage where images are captured. It will be resources/app nam/device name
     */
    get storageByDeviceName() {
        return this._args.storageByDeviceName;
    }

    set storageByDeviceName(storageFullPath: string) {
        this._args.storageByDeviceName = storageFullPath;
    }

    get storage() {
        return getStorage(this._args);
    }

    /**
     * Returns instance of wd.TouchAction object
     */
    public get touchAction() {
        return new this._wd.TouchAction(this._driver);
    }

    public webio() {
        return this._webio;
    }

    public wd() {
        return this._wd;
    }

    public async click(args) {
        return await this._webio.click(args);
    }

    public async navBack() {
        return await this._driver.back();
    }

    // Still not supported in wd
    // public async getPerformanceDataTypes() {
    //     return await this._driver.getSupportedPerformanceDataTypes;
    // }

    // public async getPerformanceData(type, timeout: number = 5) {
    //     return await this._driver.getPerformanceData(this._args.appiumCaps.appPackage, type, timeout);
    // }

    public static async createAppiumDriver(args: INsCapabilities) {
        let appiumCapsFromConfig;
        args.appiumCaps;
        if (args.appiumCaps && args.appiumCaps.settings) {
            appiumCapsFromConfig = {};
            Object.getOwnPropertyNames(args.appiumCaps).forEach(prop => {
                appiumCapsFromConfig[prop] = args.appiumCaps[prop];
            });

            delete args.appiumCaps.settings;
        }

        if (!args.isValidated) {
            await args.validateArgs();
        }

        log("Creating driver!", args.verbose);

        if (!args.attachToDebug && !args.sessionId) {
            if (!args.device) {
                args.deviceManager = args.deviceManager || new DeviceManager();
                await prepareDevice(args, args.deviceManager);
                await prepareApp(args);
            }
            await AppiumDriver.applyAdditionalSettings(args);
        }

        const webio = webdriverio.remote({
            baseUrl: args.driverConfig.host,
            port: args.driverConfig.port,
            desiredCapabilities: args.appiumCaps
        });

        const driver = await wd.promiseChainRemote(args.driverConfig);
        AppiumDriver.configureLogging(driver, args.verbose);

        let hasStarted = false;
        let retries = 10;
        while (retries > 0 && !hasStarted) {
            try {
                let sessionInfo;
                let sessionInfoDetails;
                try {
                    if (args.sessionId || args.attachToDebug) {
                        const sessionInfos = JSON.parse(((await getSessions(args.port)) || "{}") + '');

                        sessionInfo = sessionInfos.value.filter(value => args.sessionId ? args.sessionId === value.id : true)[0];
                        if (!sessionInfo || !sessionInfo.id) {
                            logError("No suitable session info found", sessionInfo);
                            process.exit(1);
                        } else {
                            args.sessionId = sessionInfo.id;
                            await driver.attach(args.sessionId);
                            sessionInfoDetails = await driver.sessionCapabilities();
                        }

                        args.appiumCaps = sessionInfo.capabilities;
                        if (sessionInfo.capabilities.automationName) {
                            (<any>args).setAutomationNameFromString(sessionInfo.capabilities.automationName);
                        }

                        prepareApp(args);
                        if (!args.device) {
                            if (args.isAndroid) {
                                args.device = DeviceManager.getDefaultDevice(args, sessionInfo.capabilities.desired.deviceName, sessionInfo.capabilities.deviceUDID.replace("emulator-", ""), sessionInfo.capabilities.deviceUDID.includes("emulator") ? DeviceType.EMULATOR : DeviceType.SIMULATOR, sessionInfo.capabilities.desired.platformVersion || sessionInfo.capabilities.platformVersion);
                            } else {
                                args.device = DeviceManager.getDefaultDevice(args);
                            }
                            args.device = DeviceManager.applyAppiumSessionInfoDetails(args, sessionInfoDetails);
                        }
                    } else {
                        sessionInfo = await driver.init(args.appiumCaps);
                        sessionInfoDetails = await driver.sessionCapabilities();
                        args.device = DeviceManager.applyAppiumSessionInfoDetails(args, sessionInfoDetails);
                    }
                } catch (error) {
                    args.verbose = true;
                    if (!args.ignoreDeviceController && error && error.message && error.message.includes("Failure [INSTALL_FAILED_INSUFFICIENT_STORAGE]")) {
                        await DeviceManager.kill(args.device);
                        await DeviceController.startDevice(args.device);
                    }
                }
                logInfo("Session info: ");
                console.info(sessionInfoDetails);
                logInfo("Appium settings: ");
                console.log(await driver.settings());

                await DeviceManager.applyDeviceAdditionsSettings(args, appiumCapsFromConfig);

                hasStarted = true;
            } catch (error) {
                console.log(error);
                console.log("Retry launching appium driver!");
                hasStarted = false;

                if (error && error.message && error.message.includes("WebDriverAgent")) {
                    const freePort = await findFreePort(100, args.wdaLocalPort);
                    console.log("args.appiumCaps['wdaLocalPort']", freePort);
                    args.appiumCaps["wdaLocalPort"] = freePort;
                }
            }

            if (hasStarted) {
                console.log("Appium driver has started successfully!");
                if (checkImageLogType(args.testReporter, LogImageType.screenshots)) {
                    args.testReporterLog(`appium_driver_started`);
                    args.testReporterLog(screencapture(`${args.reportsPath}/appium_driver_started.png`));
                }
            } else {
                logError("Appium driver is NOT started!");
                if (checkImageLogType(args.testReporter, LogImageType.screenshots)) {
                    ensureReportsDirExists(args);
                    args.testReporterLog(`appium_driver_boot_failure`);
                    args.testReporterLog(screencapture(`${args.reportsPath}/appium_driver_boot_failure.png`));
                }
            }

            retries--;
        }
        try {
            if (appiumCapsFromConfig && appiumCapsFromConfig.settings) {
                appiumCapsFromConfig.settings = JSON.parse(appiumCapsFromConfig.settings);
            }
        } catch (error) { }

        if (appiumCapsFromConfig && appiumCapsFromConfig.settings) {
            await driver.updateSettings(appiumCapsFromConfig.settings);
        }

        return new AppiumDriver(driver, wd, webio, args.driverConfig, args);
    }

    public async updateSettings(settings: any) {
        this.driver.updateSettings(settings)
    }

    /**
     *
     * @param xPath
     * @param waitForElement
     */
    public async findElementByXPath(xPath: string, waitForElement: number = this.defaultWaitTime) {
        const searchM = "waitForElementByXPath";
        return new UIElement(await this._driver.waitForElementByXPath(xPath, waitForElement), this._driver, this._wd, this._webio, this._args, searchM, xPath);
    }

    /**
     *
     * @param xPath
     * @param waitForElement
     */
    public async findElementsByXPath(xPath: string, waitForElement: number = this.defaultWaitTime) {
        return await this.convertArrayToUIElements(await this._driver.waitForElementsByXPath(xPath, waitForElement), "waitForElementsByXPath", xPath);
    }

    /**
     * Search for element by given text. The search is case insensitive for android
     * @param text
     * @param match
     * @param waitForElement
     */
    public async findElementByText(text: string, match: SearchOptions = SearchOptions.exact, waitForElement: number = this.defaultWaitTime) {
        const shouldMatch = match === SearchOptions.exact ? true : false;
        return await this.findElementByXPath(this._elementHelper.getXPathByText(text, shouldMatch), waitForElement);
    }

    /**
     * Search for element by given automationText. Searches only for exact string.
     * @param text
     * @param waitForElement
     */
    public async findElementByAutomationText(automationText: string, waitForElement: number = this.defaultWaitTime) {
        if (this.isIOS) {
            return await this.findElementByAccessibilityId(`${automationText}`, waitForElement);
        }
        return await this.findElementByXPath(this._elementHelper.getXPathByText(automationText, true), waitForElement);
    }

    /**
     * Search for element by given automationText. Searches only for exact string.
     * @param text
     * @param waitForElement
    */
    public async findElementByAutomationTextIfExists(automationText: string, waitForElement: number = this.defaultWaitTime) {
        if (this.isIOS) {
            return await this.findElementByAccessibilityIdIfExists(`${automationText}`, waitForElement);
        }
        return await this.findElementByXPathIfExists(this._elementHelper.getXPathByText(automationText, true), waitForElement);
    }

    /**
     * Search for element by given automationText and waits until the element is displayed.
     * @param text
     * @param waitInMilliseconds till element is displayed
     */
    public async waitForElement(automationText: string, waitInMilliseconds: number = this.defaultWaitTime): Promise<UIElement> {
        let element;
        try {
            element = await this.findElementByAutomationTextIfExists(automationText, 100);
        } catch (error) { }
        const startTime = Date.now();
        while ((!element || !(await element.isDisplayed())) && Date.now() - startTime <= waitInMilliseconds) {
            try {
                element = await this.findElementByAutomationTextIfExists(automationText, 100);
            } catch (error) { }
        }

        if (!element || !await element.isDisplayed()) {
            const msg = `Element with automationText: '${automationText}' is not displayed after ${waitInMilliseconds} milliseconds.`;
            logInfo(msg);
        }

        return element;
    }

    /**
     * Search for elements by given automationText. Searches only for exact string. Returns promise with array of elements.
     * @param text
     * @param waitForElement
     */
    public async findElementsByAutomationText(automationText: string, waitForElement: number = this.defaultWaitTime): Promise<UIElement[]> {
        if (this.isIOS) {
            return await this.findElementsByAccessibilityId(`${automationText}`);
        }
        return await this.findElementsByXPath(this._elementHelper.getXPathByText(automationText, true), waitForElement);
    }

    /**
     * Search for elements by given text. The search is case insensitive for android
     * @param text
     * @param match
     * @param waitForElement
     */
    public async findElementsByText(text: string, match: SearchOptions = SearchOptions.exact, waitForElement: number = this.defaultWaitTime) {
        const shouldMatch = match === SearchOptions.exact ? true : false;
        return await this.findElementsByXPath(this._elementHelper.getXPathByText(text, shouldMatch), waitForElement);
    }

    /**
     * Searches for element by element native class name like button, textView etc which will be translated to android.widgets.Button or XCUIElementTypeButton (iOS 10 and higher) or UIElementButton (iOS 9)
     * Notice this is not the same as css class
     * @param className
     * @param waitForElement
     */
    public async findElementByClassName(className: string, waitForElement: number = this.defaultWaitTime) {
        return new UIElement(await this._driver.waitForElementByClassName(className, waitForElement), this._driver, this._wd, this._webio, this._args, "waitForElementByClassName", className);
    }

    /**
     * Searches for element by element native class name like button, textView etc which will be translated to android.widgets.Button or XCUIElementTypeButton (iOS 10 and higher) or UIElementButton (iOS 9)
     * Notice this is not the same as css class
     * @param className
     * @param waitForElement
     */
    public async findElementsByClassName(className: string, waitForElement: number = this.defaultWaitTime) {
        return await this.convertArrayToUIElements(await this._driver.waitForElementsByClassName(className, waitForElement), "waitForElementsByClassName", className);
    }

    /**
     * Find element by automationText
     * @param id
     * @param waitForElement
     */
    public async findElementByAccessibilityId(id, waitForElement: number = this.defaultWaitTime) {
        return new UIElement(await this._driver.waitForElementByAccessibilityId(id, waitForElement), this._driver, this._wd, this._webio, this._args, "waitForElementByAccessibilityId", id);
    }

    /**
     * Find elements by automationText
     * @param id
     * @param waitForElement
     */
    public async findElementsByAccessibilityId(id: string, waitForElement: number = this.defaultWaitTime) {
        return await this.convertArrayToUIElements(await this._driver.waitForElementsByAccessibilityId(id, waitForElement), "waitForElementsByAccessibilityId", id);
    }

    /**
     * Scrolls from point to other point with minimum inertia
     * @param direction
     * @param y
     * @param x
     * @param yOffset
     * @param xOffset
     */
    public async scroll(direction: Direction, y: number, x: number, yOffset: number, xOffset: number = 0) {
        await scroll(this._wd, this._driver, direction, this._webio.isIOS, y, x, yOffset, xOffset, this._args.verbose);
    }

    /**
     *
     * @param direction
     * @param element
     * @param startPoint
     * @param yOffset
     * @param xOffset
     * @param retryCount
     */
    public async scrollTo(direction: Direction, element: any, startPoint: Point, yOffset: number, xOffset: number = 0, retryCount: number = 7) {
        let el: UIElement = null;
        let isDisplayed: boolean = false;
        while ((el === null || !isDisplayed) && retryCount > 0) {
            try {
                el = await element();
                isDisplayed = await el.isDisplayed();
                if (!isDisplayed) {
                    await scroll(this._wd, this._driver, direction, this._webio.isIOS, startPoint.y, startPoint.x, yOffset, xOffset, this._args.verbose);
                    el = null;
                }
            } catch (error) {
                console.log("scrollTo Error: " + error);
            }

            retryCount--;
        }

        return el;
    }

    /**
     * Swipe from point with offset and inertia according to duatio
     * @param y
     * @param x
     * @param yOffset
     * @param inertia
     * @param xOffset
     */
    public async swipe(y: number, x: number, yOffset: number, inertia: number = 250, xOffset: number = 0) {
        let direction = 1;
        if (this._webio.isIOS) {
            direction = -1;
        }

        const action = new this._wd.TouchAction(this._driver);
        action
            .press({ x: x, y: y })
            .wait(inertia)
            .moveTo({ x: xOffset, y: direction * yOffset })
            .release();
        await action.perform();
        await this._driver.sleep(150);
    }

    /**
    * Click a point by providing coordinates
    * @param x
    * @param y
    */
    public async clickPoint(xCoordinate: number, yCoordinate: number) {
        let action = new this._wd.TouchAction(this._driver);
        action
            .tap({ x: xCoordinate, y: yCoordinate });
        await action.perform();
        await this._driver.sleep(150);
    }

    async getOrientation(): Promise<DeviceOrientaion> {
        return await this._driver.getOrientation();
    }

    public async setOrientation(orientation: DeviceOrientaion) {
        logInfo(`Set device orientation: ${orientation}`)
        await this._driver.setOrientation(orientation);

        if (orientation === DeviceOrientaion.LANDSCAPE) {
            this.imageHelper.imageCropRect.left = this._imageHelper.options.cropRectangele.left;
            this.imageHelper.imageCropRect.top = this._imageHelper.options.cropRectangele.top;
            this.imageHelper.imageCropRect.width = this._imageHelper.options.cropRectangele.height;
            this.imageHelper.imageCropRect.height = this._imageHelper.options.cropRectangele.width;
        } else {
            this.imageHelper.imageCropRect = undefined;
        }
    }

    public async source() {
        return await this._webio.source();
    }

    public async sessionId() {
        return await this.driver.getSessionId();
    }

    public async compareElement(element: UIElement, imageName: string, tolerance: number = 0.01, timeOutSeconds: number = 3, toleranceType?: ImageOptions) {
        return await this.compareRectangle(await element.getActualRectangle(), imageName, timeOutSeconds, tolerance, toleranceType);
    }

    public async compareRectangle(rect: IRectangle, imageName: string, timeOutSeconds: number = 3, tolerance: number = 0.01, toleranceType?: ImageOptions) {
        return await this.imageHelper.compare({ imageName: imageName, timeOutSeconds: timeOutSeconds, tolerance: tolerance, cropRectangele: rect, toleranceType: toleranceType });
    }

    public async compareScreen(imageName: string, timeOutSeconds: number = 3, tolerance: number = 0.01, toleranceType?: ImageOptions) {
        return await this.imageHelper.compare({ imageName: imageName, timeOutSeconds: timeOutSeconds, tolerance: tolerance, toleranceType: toleranceType });
    }

    /**
     * @param videoName
     * @param callback when to stop video recording. In order an element is found. Should return true to exit
     */
    public async recordVideo(videoName, callback: () => Promise<any>): Promise<any> {
        return DeviceController.recordVideo((<IDevice>this._args.device), this._args.storageByDeviceName, videoName, callback);
    }

    private _recordVideoInfo;
    /**
     * @param videoName
     */
    public startRecordingVideo(videoName) {
        videoName = videoName.replace(/\s/gi, "");
        console.log("DEVICE: ", this._args.device);
        this._recordVideoInfo = DeviceController.startRecordingVideo(this._args.device, this._args.reportsPath, videoName);
        this._recordVideoInfo['device'] = (<IDevice>this._args.device);
        return this._recordVideoInfo['pathToVideo'];
    }

    public stopRecordingVideo(): Promise<any> {
        this._recordVideoInfo['videoRecoringProcess'].kill("SIGINT");
        wait(this.isIOS ? 100 : 10000);
        if (this._args.device.type === DeviceType.EMULATOR || this._args.device.platform === Platform.ANDROID) {
            AndroidController.pullFile(
                this._recordVideoInfo['device'],
                this._recordVideoInfo['devicePath'],
                this._recordVideoInfo['pathToVideo'].endsWith(".mp4") ? this._recordVideoInfo['pathToVideo'] : `${this._recordVideoInfo['pathToVideo']}.mp4`);
            wait(20000);
        }

        return Promise.resolve(this._recordVideoInfo['pathToVideo']);
    }

    public takeScreenshot(fileName: string) {
        if (!fileName.endsWith(ImageHelper.pngFileExt)) {
            fileName = fileName.concat(ImageHelper.pngFileExt);
        }

        return new Promise<string>((resolve, reject) => {
            this._driver.takeScreenshot(fileName).then(
                function (image, err) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                    writeFileSync(fileName, image, 'base64');
                    resolve(fileName);
                }
            )
        });
    }

    public async saveScreenshot(fileName: string) {
        if (!fileName.endsWith(ImageHelper.pngFileExt)) {
            fileName = fileName.concat(ImageHelper.pngFileExt);
        }

        return await this._driver.saveScreenshot(fileName);
    }

    public testReporterLog(log: any): any {
        if (this._args.testReporterLog) {
            return this._args.testReporterLog(log);
        }
        return undefined;
    }

    public async logScreenshot(fileName: string) {
        if (!fileName.endsWith(ImageHelper.pngFileExt)) {
            fileName = fileName.concat(ImageHelper.pngFileExt).replace(/\s+/ig, "_");
        }

        if (Object.getOwnPropertyNames(this._args.testReporter).length > 0) {
            this.testReporterLog(fileName.replace(/\.\w+/ig, ""));
            fileName = join(this._args.reportsPath, fileName);
            fileName = this.testReporterLog(fileName);
        }

        fileName = resolvePath(this._args.reportsPath, fileName)

        const imgPath = await this.saveScreenshot(fileName);
        return imgPath;
    }

    public async getlog(logType: LogType) {
        const logs = await this._driver.log(logType);
        return logs;
    }

    public async logPageSource(fileName: string) {
        if (!fileName.endsWith(".xml")) {
            fileName = fileName.concat(".xml");
        }

        const path = resolvePath(this._args.reportsPath, fileName);
        const xml = await this.source();
        writeFileSync(path, xml.value, 'utf8');
    }

    public async logDeviceLog(fileName, logType: LogType, filter: string = undefined) {
        let logs;
        try {
            logs = await this.getlog(logType);
        } catch (error) {
            logError(`Failed to get log type: ${logType}`);
        }
        let deviceLog = ""
        logs.forEach(log => {
            const curruntLog = `\n${JSON.stringify(log)}`;
            if (filter) {
                if (curruntLog.includes(filter)) {
                    deviceLog += `\n${JSON.stringify(log)}`;
                }
            } else {
                deviceLog += `\n${JSON.stringify(log)}`;
            }
        });

        if (logs.length > 0 && deviceLog) {
            const ext = extname(fileName);
            fileName = fileName.replace(ext, "");
            fileName = fileName.concat('_').concat(logType);
            fileName = fileName.concat(".log");

            const path = resolvePath(this._args.reportsPath, fileName);
            writeFileSync(path, deviceLog, 'utf8');
        } else {
            console.log(`Log type: ${logType} is empty!`);
        }
    }

    /**
     * This method will snapshot the screen of device, get page source and log from device
     * @param logName 
     */
    public async logTestArtifacts(logName: string) {
        await this.logScreenshot(logName);
        await this.logPageSource(logName);

        if (this.isAndroid) {
            await this.logDeviceLog(logName, LogType.logcat);
        } else {
            await this.logDeviceLog(logName, LogType.crashlog);
            await this.logDeviceLog(logName, LogType.syslog);
        }
    }

    /**
     * Send the currently active app to the background
     * @param time in seconds
     */
    public async backgroundApp(seconds: number) {
        logInfo("Sending the currently active app to the background ...");
        this._args.testReporterLog("Sending the currently active app to the background ...");

        await this._driver.backgroundApp(seconds);
    }

    /**
     * Hides device keyboard
     */
    public async hideDeviceKeyboard() {
        try {
            await this._driver.hideDeviceKeyboard();
        } catch (error) { }
    }

    public async isKeyboardShown() {
        return await this._driver.isKeyboardShown();
    }

    public async resetApp() {
        await this._driver.resetApp();
    }

    public async init() {
        await this._driver.init(this._args.appiumCaps);
        this._webio.requestHandler.sessionID = this._driver.sessionID;
        this._isAlive = true;
    }

    public async quit() {
        if (this._recordVideoInfo && this._recordVideoInfo['videoRecordingProcess']) {
            this._recordVideoInfo['videoRecordingProcess'].kill("SIGINT");
        }
        try {
            if (!this._args.attachToDebug) {
                console.log("Killing driver...");
                await this._driver.quit();
                this._isAlive = false;
                console.log("Driver is dead!");
                if (checkImageLogType(this._args.testReporter, LogImageType.screenshots)) {
                    this._args.testReporterLog(`appium_driver_quit`);
                    this._args.testReporterLog(screencapture(`${this._args.reportsPath}/appium_driver_quit.png`));
                }
            } else {
                //await this._webio.detach();
            }
        } catch (error) {
            if (this._args.verbose) {
                if (checkImageLogType(this._args.testReporter, LogImageType.screenshots)) {
                    this._args.testReporterLog(`appium_driver_quit_failure`);
                    this._args.testReporterLog(screencapture(`${this._args.reportsPath}/appium_driver_quit_failure.png`));
                }
                console.dir(error);
            }
        }
    }

    private static async applyAdditionalSettings(args) {
        if (args.isSauceLab) return;

        args.appiumCaps['udid'] = args.appiumCaps['udid'] || args.device.token;
        if (args.device.type === DeviceType.EMULATOR && args.device.token) {
            args.appiumCaps['udid'] = args.device.token.startsWith("emulator") ? args.device.token : `emulator-${args.device.token}`;
        }

        if (!args.appiumCaps['udid']) {
            delete args.appiumCaps['udid'];
        }

        if (args.appiumCaps.platformName.toLowerCase() === Platform.IOS) {
            args.appiumCaps["useNewWDA"] = args.appiumCaps.useNewWDA;
            args.appiumCaps["wdaStartupRetries"] = 5;
            args.appiumCaps["shouldUseSingletonTestManager"] = args.appiumCaps.shouldUseSingletonTestManager;

            // It looks we need it for XCTest (iOS 10+ automation)
            if (args.appiumCaps.platformVersion >= 10 && args.wdaLocalPort) {
                console.log(`args.appiumCaps['wdaLocalPort']: ${args.wdaLocalPort}`);
                args.appiumCaps["wdaLocalPort"] = args.wdaLocalPort;
            }
        } else {
            if (process.env["SYSTEM_PORT"]) {
                args.appiumCaps['systemPort'] = process.env["SYSTEM_PORT"];
            }
        }
    }

    private async convertArrayToUIElements(array, searchM, args) {
        const arrayOfUIElements = new Array<UIElement>();
        if (!array || array === null) {
            return arrayOfUIElements;
        }

        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            arrayOfUIElements.push(new UIElement(await element, this._driver, this._wd, this._webio, this._args, searchM, args, index));
        }

        return arrayOfUIElements;
    }

    private static configureLogging(driver, verbose) {
        driver.on("status", function (info) {
            log(info, verbose);
        });
        driver.on("quit", function (info) {
            console.log("QUIT: ", info);
        });
        driver.on("command", function (meth, path, data) {
            log(" > " + meth + " " + path + " " + (data || ""), verbose);
        });
        driver.on("http", function (meth, path, data) {
            log(" > " + meth + " " + path + " " + (data || ""), verbose);
        });
    };

    /**
    * Wait specific amount of time before continue execution
    * @param milliseconds
    */
    public async sleep(milliseconds: number) {
        await this._driver.sleep(milliseconds);
    }

    /**
  * Wait specific amount of time before continue execution
  * @param milliseconds
  */
    public wait(milliseconds: number) {
        wait(milliseconds);
    }


    /**
    * Search for element by given xPath but does not throw error if can not find it. Instead returns 'undefined'.
    * @param xPath
    * @param waitForElement
    */
    public async findElementByXPathIfExists(xPath: string, waitForElement: number = this.defaultWaitTime) {
        const element = await this._driver.elementByXPathIfExists(xPath, waitForElement);
        if (element) {
            const searchMethod = "elementByXPathIfExists";
            return new UIElement(element, this._driver, this._wd, this._webio, this._args, searchMethod, xPath);
        } else {
            return undefined;
        }
    }

    /**
    * Search for element by given text but does not throw error if can not find it. Instead returns 'undefined'.
    * @param text
    * @param match
    * @param waitForElement
    */
    public async findElementByTextIfExists(text: string, match: SearchOptions = SearchOptions.exact, waitForElement: number = this.defaultWaitTime) {
        const shouldMatch = match === SearchOptions.exact ? true : false;
        return await this.findElementByXPathIfExists(this._elementHelper.getXPathByText(text, shouldMatch), waitForElement);
    }

    /**
    * Search for element by automationText but does not throw error if can not find it. Instead returns 'undefined'.
    * @param id
    * @param waitForElement
    */
    public async findElementByAccessibilityIdIfExists(id: string, waitForElement: number = this.defaultWaitTime) {
        let element = undefined;
        try {
            element = await this._driver.elementByAccessibilityIdIfExists(id, waitForElement);
        } catch (error) { }

        if (element) {
            const searchMethod = "elementByAccessibilityIdIfExists";
            return await new UIElement(element, this._driver, this._wd, this._webio, this._args, searchMethod, id);
        }

        return element;
    }

    public async setDontKeepActivities(value: boolean) {
        if (this._args.isAndroid) {
            const output = await DeviceManager.setDontKeepActivities(this._args, this._driver, value);
        } else {
            // Do nothing for iOS ...
        }
    }

    /**
     *  Experimental feature that is still tricky to use!!!
     *  Find location on the screen by provided image.
     * @param image The name of the image without the extension.
     * @param imageThreshold The degree of match for current search, on the scale between 0 and 1. Default 0.4
     */
    public async findElementByImage(image: string, imageThreshold = 0.4) {
        await this._driver.updateSettings({ imageMatchThreshold: imageThreshold });
        const imageName = addExt(image, ImageHelper.pngFileExt);
        const pathExpectedImage = this._imageHelper.getExpectedImagePath(imageName);

        if (!existsSync(pathExpectedImage)) {
            throw new Error("The provided image does not exist!!!");
        }
        const imageAsBase64 = encodeImageToBase64(pathExpectedImage);
        let searchResult;
        try {
            searchResult = await this._driver.elementByImage(imageAsBase64);
        } catch (error) {
            throw new Error(error);
        } finally {
            // reset setting to default value
            await this._driver.updateSettings({ imageMatchThreshold: 0.4 });
        }

        return new UIElement(searchResult, this._driver, this._wd, this._webio, this._args, "elementByImage", imageAsBase64);
    }
}