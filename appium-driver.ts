import * as elementHelper from "./element-finder";
import * as  utils from "./utils";
import * as  path from "path";
import { searchCustomCapabilities } from "./capabilities-helper";
require('colors');
const wd = require("wd");
const glob = require("glob");

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
export var should = chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;


export function createAppiumDriver(runType, port, capsLocation?: string, capabilities?, isSauceLab: boolean = false, activityName?) {
    let caps = capabilities;
    if (!activityName) {
        activityName = "com.tns.NativeScriptActivity";
    }

    if (!caps) {
        caps = resolveCapabilities(capsLocation)[runType];

        if (!caps) {
            throw new Error("Incorrect test run type: " + runType);
        }
    }

    let driverConfig = {
        host: "localhost",
        port: port
    };

    if (isSauceLab) {
        const sauceUser = process.env.SAUCE_USER;
        const sauceKey = process.env.SAUCE_KEY;

        if (!sauceKey || !sauceUser) {
            throw new Error("Sauce Labs Username or Access Key is missing! Check environment variables for SAUCE_USER and SAUCE_KEY !!!");
        }

        // TODO: Should be tested
        driverConfig = {
            host: "https://" + sauceUser + ":" + sauceKey + "@ondemand.saucelabs.com:443/wd/hub",
            port: 0
        }
    }

    const driver = wd.promiseChainRemote(driverConfig);
    configureLogging(driver);

    if (utils.appLocation) {
        caps.app = isSauceLab ? "sauce-storage:" + utils.appLocation : utils.appLocation;
    } else if (!caps.app) {
        console.log("Getting caps.app!");
        caps.app = getAppPath(runType);
    }

    console.log("Creating driver!");

    return new AppiumDriver(driver.init(caps), runType, port, false);
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

function getAppPath(runType) {
    console.log("runType " + runType);
    if (runType.includes("android")) {
        const apks = glob.sync("platforms/android/build/outputs/apk/*.apk").filter(function (file) { return file.indexOf("unaligned") < 0; });
        return apks[0];
    } else if (runType.includes("ios-simulator")) {
        const simulatorApps = glob.sync("platforms/ios/build/emulator/**/*.app");
        return simulatorApps[0];
    } else if (runType.includes("ios-device")) {
        const deviceApps = glob.sync("platforms/ios/build/device/**/*.ipa");
        return deviceApps[0];
    } else {
        throw new Error("No 'app' capability provided and incorrect 'runType' convention used: " + this._runType +
            ". In order to automatically search and locate app package please use 'android','ios-device','ios-simulator' in your 'runType' option. E.g --runType=android23, --runType=ios-simulator10iPhone6");
    }
};

function resolveCapabilities(capsLocation): {} {
    let customCapabilitiesConfigs: any = searchCustomCapabilities(capsLocation);
    if (customCapabilitiesConfigs) {
        const customCapabilities = JSON.parse(customCapabilitiesConfigs);
        utils.log(customCapabilities);

        return customCapabilities;
    } else {
        throw Error("No capabilities found!!!");
    }
}

export class AppiumDriver {
    private static defaultWaitTime: number = 5000;

    private caps: {};
    private customCapabilitiesConfigs: any;
    private customCapabilities: any;

    constructor(private _driver: any, private _runType: string, private _port: number, private _isSauceLab: boolean = false, private _capsLocation?: string) {
    }

    get driver() {
        return this._driver;
    }

    public findElementByXPath(xPath: string, waitForElement: number = AppiumDriver.defaultWaitTime) {
        return this._driver.waitForElementByXPath(xPath, waitForElement);
    }

    public findElementByText(text: string, match: 'exact' | 'contains', waitForElement: number = AppiumDriver.defaultWaitTime) {
        const shouldMatch = match == 'exact' ? true : false;
        return this.findElementByXPath(elementHelper.getXPathByText(text, shouldMatch, this._runType), waitForElement);
    }

    public click() {
        return this._driver.click();
    }

    public tap() {
        return this._driver.tap();
    }

    public quit() {
        return this._driver.quit();
    }
}