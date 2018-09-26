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
    getStorageByPlatform,
    getStorageByDeviceName,
    resolve,
    fileExists,
    getReportPath,
    scroll,
    findFreePort,
    wait,
    copy,
    getSessions,
    logError,
    prepareApp,
    logInfo,
    prepareDevice,
    getStorage,
    encodeImageToBase64
} from "./utils";

import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IRectangle } from "./interfaces/rectangle";
import { Point } from "./point";
import { ImageHelper } from "./image-helper";
import { ImageOptions } from "./image-options"
import { unlinkSync, writeFileSync } from "fs";
import { DeviceManager } from "../lib/device-manager";
import { extname, basename } from "path";
import { LogType } from "./log-types";

export class AppiumDriver {
    private static pngFileExt = '.png';
    private static partialUrl = "/wd/hub/session/";

    private _defaultWaitTime: number = 5000;
    private _elementHelper: ElementHelper;
    private _imageHelper: ImageHelper;
    private _isAlive: boolean = false;
    private _locators: Locator;
    private _logPath: string;
    private _storageByDeviceName: string;
    private _storageByPlatform: string;

    private constructor(private _driver: any, private _wd, private _webio: any, private _driverConfig, private _args: INsCapabilities) {
        this._elementHelper = new ElementHelper(this._args);
        this._imageHelper = new ImageHelper(this._args);
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
    * Get the storage where test results from image comparisson is logged It will be reports/app nam/device name
    */
    get reportsPath() {
        return this._logPath;
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
        return this._storageByDeviceName;
    }

    set storageByDeviceName(storageFullPath: string) {
        this._storageByDeviceName = storageFullPath;
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

    public static async createAppiumDriver(port: number, args: INsCapabilities) {
        let driverConfig: any = {
            host: "localhost",
            port: port
        };

        if (!args.isValidated) {
            args.validateArgs();
        }

        if (args.isSauceLab) {
            const sauceUser = process.env.SAUCE_USER || process.env.npm_config["SAUCE_USER"];
            const sauceKey = process.env.SAUCE_KEY || process.env.npm_config["SAUCE_KEY"];

            if (!sauceKey || !sauceUser) {
                throw new Error("Sauce Labs Username or Access Key is missing! Check environment variables for SAUCE_USER and SAUCE_KEY !!!");
            }

            driverConfig = "https://" + sauceUser + ":" + sauceKey + "@ondemand.saucelabs.com:443/wd/hub";
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
            baseUrl: driverConfig.host,
            port: driverConfig.port,
            desiredCapabilities: args.appiumCaps
        });

        const driver = await wd.promiseChainRemote(driverConfig);
        AppiumDriver.configureLogging(driver, args.verbose);

        let hasStarted = false;
        let retries = 10;
        while (retries > 0 && !hasStarted) {
            try {
                let sessionIfno;

                try {
                    if (args.sessionId || args.attachToDebug) {
                        const sessionIfnos = JSON.parse(((await getSessions(args.port)) || "{}") + '');

                        sessionIfno = sessionIfnos.value.filter(value => args.sessionId ? args.sessionId === value.id : true)[0];
                        if (!sessionIfno || !sessionIfno.id) {
                            logError("No info suitable session found", sessionIfno);
                            process.exit(1);
                        }

                        args.sessionId = sessionIfno.id;
                        args.appiumCaps = sessionIfno.capabilities;

                        prepareApp(args);
                        if (!args.device) {
                            if (args.isAndroid) {
                                args.device = DeviceManager.getDefaultDevice(args, sessionIfno.capabilities.avd, sessionIfno.capabilities.deviceUDID.replace("emulator-", ""), sessionIfno.capabilities.deviceUDID.includes("emulator") ? DeviceType.EMULATOR : DeviceType.SIMULATOR, sessionIfno.capabilities.desired.platformVersion || sessionIfno.capabilities.platformVersion);
                            } else {
                                args.device = DeviceManager.getDefaultDevice(args);
                            }
                        }

                        await driver.attach(args.sessionId);
                    } else {
                        sessionIfno = await driver.init(args.appiumCaps);
                    }

                } catch (error) {
                    args.verbose = true;
                    if (!args.ignoreDeviceController && error && error.message && error.message.includes("Failure [INSTALL_FAILED_INSUFFICIENT_STORAGE]")) {
                        await DeviceManager.kill(args.device);
                        await DeviceController.startDevice(args.device);
                    }
                }
                if (args.verbose) {
                    logInfo("Session info");
                    console.info(sessionIfno);
                }

                await DeviceManager.applyDeviceAdditionsSettings(driver, args, sessionIfno);

                hasStarted = true;
            } catch (error) {
                console.log(error);
                console.log("Rety launching appium driver!");
                if (error && error.message && error.message.includes("WebDriverAgent")) {
                    const freePort = await findFreePort(100, args.wdaLocalPort);
                    console.log("args.appiumCaps['wdaLocalPort']", freePort);
                    args.appiumCaps["wdaLocalPort"] = freePort;
                }
            }
            if (hasStarted) {
                console.log("Appium driver has started successfully!");
            } else {
                logError("Appium driver is NOT started!")
            }

            retries--;
        }

        return new AppiumDriver(driver, wd, webio, driverConfig, args);
    }

    /**
     *
     * @param xPath
     * @param waitForElement
     */
    public async findElementByXPath(xPath: string, waitForElement: number = this.defaultWaitTime) {
        const searchM = "waitForElementByXPath";
        return await new UIElement(await this._driver.waitForElementByXPath(xPath, waitForElement), this._driver, this._wd, this._webio, this._args, searchM, xPath);
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
     * Search for element by given text. The seacrch is case insensitive for android
     * @param text
     * @param match
     * @param waitForElement
     */
    public async findElementByText(text: string, match: SearchOptions = SearchOptions.exact, waitForElement: number = this.defaultWaitTime) {
        const shouldMatch = match === SearchOptions.exact ? true : false;
        return await this.findElementByXPath(this._elementHelper.getXPathByText(text, shouldMatch), waitForElement);
    }

    /**
     * Search for elements by given text. The seacrch is case insensitive for android
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
        scroll(this._wd, this._driver, direction, this._webio.isIOS, y, x, yOffset, xOffset, this._args.verbose);
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
        let el = null;
        while (el === null && retryCount > 0) {
            try {
                el = await element();
                if (!(await el.isDisplayed())) {
                    await scroll(this._wd, this._driver, direction, this._webio.isIOS, startPoint.y, startPoint.x, yOffset, xOffset, this._args.verbose);
                }
            } catch (error) {
                await scroll(this._wd, this._driver, direction, this._webio.isIOS, startPoint.y, startPoint.x, yOffset, xOffset, this._args.verbose);
            }
            if (el !== null && (await el.isDisplayed())) {
                break;
            } else {
                el = null;
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
        return await this.compare(imageName, timeOutSeconds, tolerance, rect, toleranceType);
    }

    public async compareScreen(imageName: string, timeOutSeconds: number = 3, tolerance: number = 0.01, toleranceType?: ImageOptions) {
        return await this.compare(imageName, timeOutSeconds, tolerance, undefined, toleranceType);
    }

    /**
     * @param videoName
     * @param callback when to stop video recording. In order an element is found. Should return true to exit
     */
    public async recordVideo(videoName, callback: () => Promise<any>): Promise<any> {
        if (!this._storageByDeviceName) {
            this._storageByDeviceName = getStorageByDeviceName(this._args);
        }

        return DeviceController.recordVideo((<IDevice>this._args.device), this._storageByDeviceName, videoName, callback);
    }

    private _recordVideoInfo;
    /**
     * @param videoName
     */
    public startRecordingVideo(videoName) {
        if (!this._logPath) {
            this._logPath = getReportPath(this._args);
        }

        videoName = videoName.replace(/\s/gi, "");
        console.log("DEVICE: ", this._args.device);
        this._recordVideoInfo = DeviceController.startRecordingVideo(this._args.device, this._logPath, videoName);
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

    private async compare(imageName: string, timeOutSeconds: number = 3, tolerance: number = 0.01, rect?: IRectangle, toleranceType?: ImageOptions) {

        if (!this._logPath) {
            this._logPath = getReportPath(this._args);
        }

        imageName = addExt(imageName, AppiumDriver.pngFileExt);

        const pathExpectedImage = this.getExpectedImagePath(imageName);

        // First time capture
        if (!fileExists(pathExpectedImage)) {
            const pathActualImage = resolve(this._storageByDeviceName, imageName.replace(".", "_actual."));
            await this.takeScreenshot(pathActualImage);

            if (rect) {
                await this._imageHelper.clipRectangleImage(rect, pathActualImage);
            }

            const pathActualImageToReportsFolder = resolve(this._logPath, basename(pathActualImage));
            copy(pathActualImage, pathActualImageToReportsFolder, false);

            console.log("Remove the 'actual' suffix to continue using the image as expected one ", pathExpectedImage);
            return false;
        }

        // Compare
        let pathActualImage = await this.takeScreenshot(resolve(this._logPath, imageName.replace(".", "_actual.")));
        const pathDiffImage = pathActualImage.replace("actual", "diff");

        await this.prepareImageToCompare(pathActualImage, rect);
        let result = await this._imageHelper.compareImages(pathActualImage, pathExpectedImage, pathDiffImage, tolerance, toleranceType);

        // Iterate
        if (!result) {
            const eventStartTime = Date.now().valueOf();
            let counter = 1;
            timeOutSeconds *= 1000;
            while ((Date.now().valueOf() - eventStartTime) <= timeOutSeconds && !result) {
                const pathActualImageConter = resolve(this._logPath, imageName.replace(".", "_actual_" + counter + "."));
                pathActualImage = await this.takeScreenshot(pathActualImageConter);

                await this.prepareImageToCompare(pathActualImage, rect);
                result = await this._imageHelper.compareImages(pathActualImage, pathExpectedImage, pathDiffImage, tolerance, toleranceType);
                counter++;
            }
        } else {
            if (fileExists(pathDiffImage)) {
                unlinkSync(pathDiffImage);
            }
            if (fileExists(pathActualImage)) {
                unlinkSync(pathActualImage);
            }
        }

        this._imageHelper.imageCropRect = undefined;
        return result;
    }

    public async prepareImageToCompare(filePath: string, rect: IRectangle) {
        if (rect) {
            await this._imageHelper.clipRectangleImage(rect, filePath);
            const rectToCrop = { x: 0, y: 0, width: undefined, height: undefined };
            this._imageHelper.imageCropRect = rectToCrop;
        } else {
            this._imageHelper.imageCropRect = ImageHelper.cropImageDefault(this._args);
        }
    }

    public takeScreenshot(fileName: string) {
        if (!fileName.endsWith(AppiumDriver.pngFileExt)) {
            fileName = fileName.concat(AppiumDriver.pngFileExt);
        }

        return new Promise<string>((resolve, reject) => {
            this._driver.takeScreenshot().then(
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

    public async logScreenshot(fileName: string) {
        if (!this._logPath) {
            this._logPath = getReportPath(this._args);
        }
        if (!fileName.endsWith(AppiumDriver.pngFileExt)) {
            fileName = fileName.concat(AppiumDriver.pngFileExt);
        }

        const imgPath = await this.takeScreenshot(resolve(this._logPath, fileName));
        return imgPath;
    }

    public async getlog(logType: LogType) {
        const logs = await this._driver.log(logType);
        return logs;
    }

    public async logPageSource(fileName: string) {
        if (!this._logPath) {
            this._logPath = getReportPath(this._args);
        }
        if (!fileName.endsWith(".xml")) {
            fileName = fileName.concat(".xml");
        }

        const path = resolve(this._logPath, fileName);
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

            if (!this._logPath) {
                this._logPath = getReportPath(this._args);
            }

            const path = resolve(this._logPath, fileName);
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
     * @param time in minutes
     */
    public async backgroundApp(minutes: number) {
        console.log("Sending the currently active app to the background ...");
        await this._driver.backgroundApp(minutes);
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
        console.log("Killing driver");
        if (this._recordVideoInfo && this._recordVideoInfo['videoRecoringProcess']) {
            this._recordVideoInfo['videoRecoringProcess'].kill("SIGINT");
        }
        try {
            if (!this._args.attachToDebug) {
                await this._driver.quit();
            } else {
                await this._webio.detach();
            }
        } catch (error) {
        }
        this._isAlive = false;
        console.log("Driver is dead");
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
            log(info.cyan, verbose);
        });
        driver.on("command", function (meth, path, data) {
            log(" > " + meth.yellow + path.grey + " " + (data || ""), verbose);
        });
        driver.on("http", function (meth, path, data) {
            log(" > " + meth.magenta + path + " " + (data || "").grey, verbose);
        });
    };

    private getExpectedImagePath(imageName: string) {

        if (!this._storageByDeviceName) {
            this._storageByDeviceName = getStorageByDeviceName(this._args);
        }

        let pathExpectedImage = resolve(this._storageByDeviceName, imageName);

        if (!fileExists(pathExpectedImage)) {
            if (!this._storageByPlatform) {
                this._storageByPlatform = getStorageByPlatform(this._args);
            }
            pathExpectedImage = resolve(this._storageByPlatform, imageName);
        }

        if (!fileExists(pathExpectedImage)) {
            pathExpectedImage = resolve(this._storageByDeviceName, imageName);
        }

        return pathExpectedImage;
    }

    /**
    * Wait specific amount of time before continue execution
    * @param miliseconds
    */
    public async sleep(miliseconds: number) {
        await this._driver.sleep(miliseconds);
    }

    /**
  * Wait specific amount of time before continue execution
  * @param miliseconds
  */
    public wait(miliseconds: number) {
        wait(miliseconds);
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
            return await new UIElement(element, this._driver, this._wd, this._webio, this._args, searchMethod, xPath);
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
        const imageName = addExt(image, AppiumDriver.pngFileExt);
        const pathExpectedImage = this.getExpectedImagePath(imageName);

        if (!fileExists(pathExpectedImage)) {
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