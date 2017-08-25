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

import * as blinkDiff from "blink-diff";
import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import * as utils from "./utils";

export function createAppiumDriver(runType: string, port: number, caps: any, isSauceLab: boolean = false): AppiumDriver {
    let driverConfig: any = {
        host: "localhost",
        port: port
    };

    if (isSauceLab) {
        const sauceUser = process.env.SAUCE_USER;
        const sauceKey = process.env.SAUCE_KEY;

        if (!sauceKey || !sauceUser) {
            throw new Error("Sauce Labs Username or Access Key is missing! Check environment variables for SAUCE_USER and SAUCE_KEY !!!");
        }

        driverConfig = {
            host: "https://" + sauceUser + ":" + sauceKey + "@ondemand.saucelabs.com:443/wd/hub"
        }
    }

    const driver = wd.promiseChainRemote(driverConfig);
    configureLogging(driver);

    if (utils.appLocation) {
        caps.app = isSauceLab ? "sauce-storage:" + utils.appLocation : utils.appLocation;
    } else if (!caps.app) {
        utils.log("Getting caps.app!");
        caps.app = getAppPath(caps.platformName.toLowerCase(), runType.toLowerCase());
    }

    utils.log("Creating driver!");
    return new AppiumDriver(driver.init(caps), wd, runType, port, caps, false);
}

function configureLogging(driver) {
    driver.on("status", function (info) {
        utils.log(info.cyan);
    });
    driver.on("command", function (meth, path, data) {
        utils.log(" > " + meth.yellow + path.grey + " " + (data || ""));
    });
    driver.on("http", function (meth, path, data) {
        utils.log(" > " + meth.magenta + path + " " + (data || "").grey);
    });
};

function getAppPath(platform, runType) {
    if (platform.includes("android")) {
        const apks = glob.sync("platforms/android/build/outputs/apk/*.apk").filter(function (file) { return file.indexOf("unaligned") < 0; });
        return apks[0];
    } else if (platform.includes("ios")) {
        if (runType.includes("sim")) {
            const simulatorApps = glob.sync("platforms/ios/build/emulator/**/*.app");
            return simulatorApps[0];
        } else if (runType.includes("device")) {
            const deviceApps = glob.sync("platforms/ios/build/device/**/*.ipa");
            return deviceApps[0];
        }
    } else {
        throw new Error("No 'app' capability provided and incorrect 'runType' convention used: " + runType +
            ". In order to automatically search and locate app package please use 'android','ios-device','ios-simulator' in your 'runType' option. E.g --runType android23, --runType ios-simulator10iPhone6");
    }
};

export class AppiumDriver {
    private static defaultWaitTime: number = 5000;
    private elementHelper: ElementHelper;
    private static pngFileExt = '.png';

    constructor(private _driver: any, private _wd, private _runType: string, private _port: number, private caps, private _isSauceLab: boolean = false, private _capsLocation?: string) {
        this.elementHelper = new ElementHelper(this.caps.platformName.toLowerCase(), this.caps.platformVersion.toLowerCase());
    }

    get capabilities() {
        return this.caps;
    }

    get platformName() {
        return this.caps.platformName;
    }

    get platformVesrion() {
        return this.caps.platformVesrion;
    }

    get driver() {
        return this._driver;
    }

    public async navBack() {
        return await this._driver.back();
    }

    public async findElementByXPath(xPath: string, waitForElement: number = AppiumDriver.defaultWaitTime) {
        const searchM = "waitForElementByXPath";
        return await new UIElement(await this._driver.waitForElementByXPath(xPath, waitForElement), this._driver, searchM, xPath);
    }

    public async findElementsByXPath(xPath: string, waitForElement: number = AppiumDriver.defaultWaitTime) {
        return await this.convertArrayToUIElements(await this._driver.waitForElementsByXPath(xPath, waitForElement), "waitForElementByXPath", xPath);
    }

    public async findElementByText(text: string, match: SearchOptions = SearchOptions.exact, waitForElement: number = AppiumDriver.defaultWaitTime) {
        const shouldMatch = match === SearchOptions.exact ? true : false;
        return await this.findElementByXPath(this.elementHelper.getXPathByText(text, shouldMatch), waitForElement);
    }

    public async findElementsByText(text: string, match: SearchOptions = SearchOptions.exact, waitForElement: number = AppiumDriver.defaultWaitTime) {
        const shouldMatch = match === SearchOptions.exact ? true : false;
        return await this.findElementsByXPath(this.elementHelper.getXPathByText(text, shouldMatch), waitForElement);
    }

    public async findElementsByClassName(className: string, waitForElement: number = AppiumDriver.defaultWaitTime) {
        const fullClassName = this.elementHelper.getElementClass(className);
        return await this.convertArrayToUIElements(this._driver.waitForElementsByClassName(fullClassName, waitForElement), "waitForElementByClassName", fullClassName);
    }


    public takeScreenshot(fileName: string) {
        if (!fileName.endsWith(AppiumDriver.pngFileExt)) {
            fileName.concat(AppiumDriver.pngFileExt);
        }

        return this._driver.takeScreenshot().then(
            function (image, err) {
                fs.writeFileSync(fileName, image, 'base64');
            }
        );
    }

    public compareScreen(expected: string, actual: string, output: string) {
        return new Promise((resolve, reject) => {
            let diff = new blinkDiff({
                imageAPath: actual,
                imageBPath: expected,
                imageOutputPath: output,
                // TODO: extend ...
            });

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
                        resolve(true);
                    } else {
                        message = "Screen compare failed!"
                        console.log(message);
                        console.log('Found ' + result.differences + ' differences.');
                        reject(false);
                    }
                }
            });
        });
    }

    public async quit() {
        console.log("Killing driver");
        await this._driver.quit();
        console.log("Driver is dead");
    }

    private async convertArrayToUIElements(array, searchM, args) {
        let i = 0;
        const arrayOfUIElements = new Array<UIElement>();
        array.forEach(async element => {
            arrayOfUIElements.push(new UIElement(await element, this._driver, searchM, args, i));
            i++;
        });

        return arrayOfUIElements;
    }
}