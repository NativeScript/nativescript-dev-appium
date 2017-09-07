require('colors');
var chai = require("chai");
import * as wd from "wd";
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
export var should = chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

import { searchCustomCapabilities } from "./capabilities-helper";
import { ElementHelper } from "./element-helper";
import { SearchOptions } from "./search-options";
import { UIElement } from "./ui-element";
import { log, getStorage, resolve, fileExists } from "./utils";
import { INsCapabilities } from "./ins-capabilities";

import { unlinkSync, writeFileSync } from "fs";
import * as blinkDiff from "blink-diff";
import * as webdriverio from "webdriverio";
import { getAppPath } from "./utils";

export class AppiumDriver {
    private static defaultWaitTime: number = 5000;
    private static pngFileExt = '.png';
    private static partialUrl = "/wd/hub/session/";

    private _elementHelper: ElementHelper;
    private _storage: string;
    private _isAlive: boolean = false;

    private constructor(private _driver: any, private webio: any, private _driverConfig, private _args: INsCapabilities) {
        this._elementHelper = new ElementHelper(this._args.appiumCaps.platformName.toLowerCase(), this._args.appiumCaps.platformVersion.toLowerCase());
        this.webio.requestHandler.sessionID = this._driver.sessionID;
        this._storage = getStorage(this._args);
        this._isAlive = true;
    }

    get capabilities() {
        return this._args.appiumCaps;
    }

    get platformName() {
        return this._args.appiumCaps.platformName;
    }

    get platformVesrion() {
        return this._args.appiumCaps.platformVesrion;
    }

    get elementHelper() {
        return this._elementHelper;
    }

    get isAlive() {
        return this._isAlive;
    }

    get driver() {
        return this._driver;
    }

    public async wdio() {
        return await this.webio;
    }

    public async click(args) {
        return await this.webio.click(args);
    }

    public async navBack() {
        return await this._driver.back();
    }

    public async findElementByXPath(xPath: string, waitForElement: number = AppiumDriver.defaultWaitTime) {
        const searchM = "waitForElementByXPath";
        return await new UIElement(await this._driver.waitForElementByXPath(xPath, waitForElement), this._driver, this.webio, searchM, xPath);
    }

    public async findElementsByXPath(xPath: string, waitForElement: number = AppiumDriver.defaultWaitTime) {
        return await this.convertArrayToUIElements(await this._driver.waitForElementsByXPath(xPath, waitForElement), "waitForElementByXPath", xPath);
    }

    public async findElementByText(text: string, match: SearchOptions = SearchOptions.exact, waitForElement: number = AppiumDriver.defaultWaitTime) {
        const shouldMatch = match === SearchOptions.exact ? true : false;
        return await this.findElementByXPath(this._elementHelper.getXPathByText(text, shouldMatch), waitForElement);
    }

    public async findElementsByText(text: string, match: SearchOptions = SearchOptions.exact, waitForElement: number = AppiumDriver.defaultWaitTime) {
        const shouldMatch = match === SearchOptions.exact ? true : false;
        return await this.findElementsByXPath(this._elementHelper.getXPathByText(text, shouldMatch), waitForElement);
    }

    public async findElementsByClassName(className: string, waitForElement: number = AppiumDriver.defaultWaitTime) {
        const fullClassName = this._elementHelper.getElementClass(className);
        return await this.convertArrayToUIElements(await this._driver.waitForElementsByClassName(fullClassName, waitForElement), "waitForElementByClassName", fullClassName);
    }

    public async findElementByAccessibilityId(id, waitForElement: number = AppiumDriver.defaultWaitTime) {
        return new UIElement(await this._driver.waitForElementByAccessibilityId(id, waitForElement), this._driver, this.webio, "waitForElementByAccessibilityId", id);
    }

    public async findElementsByAccessibilityId(id: string, waitForElement: number = AppiumDriver.defaultWaitTime) {
        return await this.convertArrayToUIElements(await this._driver.waitForElementsByAccessibilityId(id, waitForElement), "waitForElementsByAccessibilityId", id);
    }

    public async source() {
        return await this.webio.source();
    }

    public async  sessionId() {
        return await this.driver.getSessionId();
    }

    public async compareScreen(imageName: string, timeOutSeconds: number, tollerance: number) {
        if (!imageName.endsWith(AppiumDriver.pngFileExt)) {
            imageName = imageName.concat(AppiumDriver.pngFileExt);
        }

        let actualImage = await this.takeScreenshot(resolve(this._storage, imageName.replace(".", "_actual.")));
        let expectedImage = resolve(this._storage, imageName);
        if (!fileExists(expectedImage)) {
            console.log("To confirm the image the '_actual' sufix should be removed from image name: ", expectedImage);
            return false;
        }

        let diffImage = expectedImage.replace(".", "_diff.");
        let result = await this.compareImages(expectedImage, actualImage, diffImage);
        if (!result) {
            let eventStartTime = Date.now().valueOf();
            let counter = 1;
            timeOutSeconds *= 1000;
            while ((Date.now().valueOf() - eventStartTime) <= timeOutSeconds && !result) {
                let actualImage = await this.takeScreenshot(resolve(this._storage, imageName.replace(".", "_actual" + "_" + counter + ".")));
                result = await this.compareImages(expectedImage, actualImage, diffImage);
                counter++;
            }
        } else {
            unlinkSync(diffImage);
            unlinkSync(actualImage);
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

    public compareImages(expected: string, actual: string, output: string) {
        let diff = new blinkDiff({
            imageAPath: actual,
            imageBPath: expected,
            imageOutputPath: output,
            // TODO: extend ...
        });

        return new Promise<boolean>((resolve, reject) => {
            diff.run(function (error, result) {
                if (error) {
                    throw error;
                } else {
                    let message;
                    let resultCode = diff.hasPassed(result.code);
                    if (resultCode) {
                        message = "Screen compare passed!";
                        console.log(message);
                        console.log('Found ' + result.differences + ' differences.');
                        return resolve(true);
                    } else {
                        message = "Screen compare failed!"
                        console.log(message);
                        console.log('Found ' + result.differences + ' differences.');
                        console.log('Diff image ' + output);

                        return resolve(false);
                    }
                }
            });
        });
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

            driverConfig = {
                host: "https://" + sauceUser + ":" + sauceKey + "@ondemand.saucelabs.com:443/wd/hub"
            }
        }

        const driver = await wd.promiseChainRemote(driverConfig);
        AppiumDriver.configureLogging(driver, args.verbose);

        if (args.appiumCaps.app) {
            args.appiumCaps.app = args.isSauceLab ? "sauce-storage:" + args.appRootPath : args.appRootPath;
        } else if (!args.appiumCaps.app) {
            log("Getting caps.app!", args.verbose);
            args.appiumCaps.app = getAppPath(args.appiumCaps.platformName.toLowerCase(), args.runType.toLowerCase());
        }

        log("Creating driver!", args.verbose);

        const webio = webdriverio.remote({
            baseUrl: driverConfig.host,
            port: driverConfig.port,
            logLevel: 'warn',
            desiredCapabilities: args.appiumCaps
        });

        (await driver.init(args.appiumCaps));
        return new AppiumDriver(driver, webio, driverConfig, args);
    }

    public async inint() {
        await this._driver.init(this._args.appiumCaps);
        this.webio.requestHandler.sessionID = this._driver.sessionID;
    }

    public async quit() {
        console.log("Killing driver");
        try {
            await this._driver.quit();
            await this.webio.end();
        } catch (error) {
            console.dir(error);
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
            arrayOfUIElements.push(new UIElement(await element, this._driver, this.wdio, searchM, args, i));
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