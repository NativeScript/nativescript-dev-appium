require('colors');
var chai = require("chai");
import * as wd from "wd";
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
export var should = chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

import { ElementHelper } from "./element-helper";
import { SearchOptions } from "./search-options";
import { UIElement } from "./ui-element";
import { Direction } from "./direction";
import { Locator } from "./locators";
import {
    log,
    getStorage,
    resolve,
    fileExists,
    getAppPath,
    getReportPath,
    calculateOffset,
    scroll
} from "./utils";
import { INsCapabilities } from "./ins-capabilities";
import { Point } from "./point";
import { ImageHelper } from "./image-helper";
import { ImageOptions } from "./image-options"
import { unlinkSync, writeFileSync } from "fs";
import * as webdriverio from "webdriverio";

export class AppiumDriver {
    private static pngFileExt = '.png';
    private static partialUrl = "/wd/hub/session/";

    private _defaultWaitTime: number = 5000;
    private _elementHelper: ElementHelper;
    private _imageHelper: ImageHelper;
    private _isAlive: boolean = false;
    private _locators: Locator;
    private _logPath: string;
    private _storage: string;

    private constructor(private _driver: any, private _wd, private _webio: any, private _driverConfig, private _args: INsCapabilities) {
        this._elementHelper = new ElementHelper(this._args.appiumCaps.platformName.toLowerCase(), this._args.appiumCaps.platformVersion.toLowerCase());
        this._imageHelper = new ImageHelper(this._args);
        this._isAlive = true;
        this._locators = new Locator(this._args.appiumCaps.platformName, this._args.appiumCaps.platformVersion);
        this._webio.requestHandler.sessionID = this._driver.sessionID;
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

    get driver() {
        return this._driver;
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

    /**
     * 
     * @param xPath 
     * @param waitForElement 
     */
    public async findElementByXPath(xPath: string, waitForElement: number = this.defaultWaitTime) {
        const searchM = "waitForElementByXPath";
        return await new UIElement(await this._driver.waitForElementByXPath(xPath, waitForElement), this._driver, this._wd, this._webio, searchM, xPath);
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
        return new UIElement(await this._driver.waitForElementByClassName(className, waitForElement), this._driver, this._wd, this._webio, "waitForElementByClassName", className);
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
        return new UIElement(await this._driver.waitForElementByAccessibilityId(id, waitForElement), this._driver, this._wd, this._webio, "waitForElementByAccessibilityId", id);
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

    public async source() {
        return await this._webio.source();
    }

    public async sessionId() {
        return await this.driver.getSessionId();
    }

    public async compareScreen(imageName: string, timeOutSeconds: number = 3, tollerance: number = 0.01) {
        if (!imageName.endsWith(AppiumDriver.pngFileExt)) {
            imageName = imageName.concat(AppiumDriver.pngFileExt);
        }

        if (!this._storage) {
            this._storage = getStorage(this._args);
        }

        if (!this._logPath) {
            this._logPath = getReportPath(this._args);
        }

        let expectedImage = resolve(this._storage, imageName);

        // Firts capture of screen when the expected image is not available
        if (!fileExists(expectedImage)) {
            await this.takeScreenshot(resolve(this._storage, imageName.replace(".", "_actual.")));
            console.log("Remove the 'actual' suffix to continue using the image as expected one ", expectedImage);
            let eventStartTime = Date.now().valueOf();
            let counter = 1;
            timeOutSeconds *= 1000;

            while ((Date.now().valueOf() - eventStartTime) <= timeOutSeconds) {
                let actualImage = await this.takeScreenshot(resolve(this._logPath, imageName.replace(".", "_actual" + "_" + counter + ".")));
                counter++;
            }

            return false;
        }

        let actualImage = await this.takeScreenshot(resolve(this._logPath, imageName.replace(".", "_actual.")));
        let diffImage = actualImage.replace("actual", "diff");
        let result = await this._imageHelper.compareImages(actualImage, expectedImage, diffImage, tollerance);
        if (!result) {
            let eventStartTime = Date.now().valueOf();
            let counter = 1;
            timeOutSeconds *= 1000;
            while ((Date.now().valueOf() - eventStartTime) <= timeOutSeconds && !result) {
                let actualImage = await this.takeScreenshot(resolve(this._logPath, imageName.replace(".", "_actual" + "_" + counter + ".")));
                result = await this._imageHelper.compareImages(actualImage, expectedImage, diffImage, tollerance);
                counter++;
            }
        } else {
            if (fileExists(diffImage)) {
                unlinkSync(diffImage);
            }
            if (fileExists(actualImage)) {
                unlinkSync(actualImage);
            }
        }

        return result;
    }

    public takeScreenshot(fileName: string) {
        if (!fileName.endsWith(AppiumDriver.pngFileExt)) {
            fileName = fileName.concat(AppiumDriver.pngFileExt);
        }

        return new Promise<string>((resolve, reject) => {
            this._driver.takeScreenshot().then(
                function (image, err) {
                    writeFileSync(fileName, image, 'base64');
                    resolve(fileName);
                }
            )
        });
    }

    public async logScreenshot(fileName: string) {
        if (!this._logPath && !fileExists(fileName)) {
            this._logPath = getReportPath(this._args);
        }
        if (!fileName.endsWith(AppiumDriver.pngFileExt)) {
            fileName = fileName.concat(AppiumDriver.pngFileExt);
        }

        const imgPath = await this.takeScreenshot(resolve(this._logPath, fileName));
        return imgPath;
    }

    public async logPageSource(fileName: string) {
        if (!this._logPath && !fileExists(fileName)) {
            this._logPath = getReportPath(this._args);
        }
        if (!fileName.endsWith(".xml")) {
            fileName = fileName.concat(".xml");
        }

        const path = resolve(this._logPath, fileName);
        const xml = await this.source();
        writeFileSync(path, xml.value, 'utf8');
    }

    public static async createAppiumDriver(port: number, args: INsCapabilities) {
        let driverConfig: any = {
            host: "localhost",
            port: port
        };

        if (args.isSauceLab) {
            const sauceUser = process.env.SAUCE_USER;
            const sauceKey = process.env.SAUCE_KEY;

            if (!sauceKey || !sauceUser) {
                throw new Error("Sauce Labs Username or Access Key is missing! Check environment variables for SAUCE_USER and SAUCE_KEY !!!");
            }

            driverConfig = "https://" + sauceUser + ":" + sauceKey + "@ondemand.saucelabs.com:443/wd/hub";


            args.appiumCaps.app = "sauce-storage:" + args.appPath;
            console.log("Using Sauce Labs. The application path is changed to: " + args.appPath);
        }

        log("Creating driver!", args.verbose);

        const _webio = webdriverio.remote({
            baseUrl: driverConfig.host,
            port: driverConfig.port,
            logLevel: 'warn',
            desiredCapabilities: args.appiumCaps
        });

        const driver = await wd.promiseChainRemote(driverConfig);
        AppiumDriver.configureLogging(driver, args.verbose);
        await driver.init(args.appiumCaps);
        return new AppiumDriver(driver, wd, _webio, driverConfig, args);
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
        try {
            await this._driver.quit();
            await this._driver.quit();
            await this._webio.quit();
        } catch (error) {
        }
        this._isAlive = false;
        console.log("Driver is dead");
    }

    private async convertArrayToUIElements(array, searchM, args) {
        let i = 0;
        const arrayOfUIElements = new Array<UIElement>();
        if (!array || array === null) {
            return arrayOfUIElements;
        }
        array.forEach(async element => {
            arrayOfUIElements.push(new UIElement(await element, this._driver, this._wd, this._webio, searchM, args, i));
            i++;
        });

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
}