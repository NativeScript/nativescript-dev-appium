"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var elementHelper = require("./element-finder");
var utils = require("./utils");
var path = require("path");
var capabilities_helper_1 = require("./capabilities-helper");
require('colors');
var wd = require("wd");
var glob = require("glob");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
exports.should = chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
function createDriver(capabilities, activityName) {
    var caps = capabilities;
    if (!activityName) {
        activityName = "com.tns.NativeScriptActivity";
    }
    if (!caps) {
        caps = this.resolveCapabilities()[this._runType];
        if (!caps) {
            throw new Error("Incorrect test run type: " + this._runType + " . Available run types are :" + this.customCapabilitiesConfigs);
        }
    }
    var driverConfig = {
        host: "localhost",
        port: this._port
    };
    if (this._isSauceLab) {
        var sauceUser = process.env.SAUCE_USER;
        var sauceKey = process.env.SAUCE_KEY;
        if (!sauceKey || !sauceUser) {
            throw new Error("Sauce Labs Username or Access Key is missing! Check environment variables for SAUCE_USER and SAUCE_KEY !!!");
        }
        // TODO: Should be tested
        driverConfig = {
            host: "https://" + sauceUser + ":" + sauceKey + "@ondemand.saucelabs.com:443/wd/hub",
            port: 0
        };
    }
    var driver = wd.promiseChainRemote(driverConfig);
    this.configureLogging(driver);
    if (utils.appLocation) {
        caps.app = this._isSauceLab ? "sauce-storage:" + utils.appLocation : utils.appLocation;
    }
    else if (!caps.app) {
        console.log("Getting caps.app!");
        caps.app = this.getAppPath();
    }
    console.log("Creating driver!");
    this._driver = driver.init(caps);
}
exports.createDriver = createDriver;
var AppiumDriver = (function () {
    function AppiumDriver(_runType, _port, _isSauceLab, _capsLocation) {
        if (_isSauceLab === void 0) { _isSauceLab = false; }
        this._runType = _runType;
        this._port = _port;
        this._isSauceLab = _isSauceLab;
        this._capsLocation = _capsLocation;
    }
    AppiumDriver.prototype.resolveCapabilities = function () {
        if (!this._capsLocation) {
            this._capsLocation = utils.resolve(path.dirname(utils.projectDir()));
        }
        this.customCapabilitiesConfigs = capabilities_helper_1.searchCustomCapabilities(this._capsLocation);
        utils.log(this.customCapabilities);
        if (this.customCapabilitiesConfigs) {
            this.customCapabilities = JSON.parse(this.customCapabilitiesConfigs);
            utils.log(this.customCapabilities);
        }
        return this.customCapabilities;
    };
    AppiumDriver.prototype.configureLogging = function (driver) {
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
    ;
    AppiumDriver.prototype.getAppPath = function () {
        console.log("runType " + this._runType);
        if (this._runType.includes("android")) {
            var apks = glob.sync("platforms/android/build/outputs/apk/*.apk").filter(function (file) { return file.indexOf("unaligned") < 0; });
            return apks[0];
        }
        else if (this._runType.includes("ios-simulator")) {
            var simulatorApps = glob.sync("platforms/ios/build/emulator/**/*.app");
            return simulatorApps[0];
        }
        else if (this._runType.includes("ios-device")) {
            var deviceApps = glob.sync("platforms/ios/build/device/**/*.ipa");
            return deviceApps[0];
        }
        else {
            throw new Error("No 'app' capability provided and incorrect 'runType' convention used: " + this._runType +
                ". In order to automatically search and locate app package please use 'android','ios-device','ios-simulator' in your 'runType' option. E.g --runType=android23, --runType=ios-simulator10iPhone6");
        }
    };
    ;
    AppiumDriver.prototype.findElementByXPath = function (xPath, waitForElement) {
        if (waitForElement === void 0) { waitForElement = AppiumDriver.defaultWaitTime; }
        return this._driver.waitForElementByXPath(xPath, waitForElement);
    };
    AppiumDriver.prototype.findElementByText = function (text, match, waitForElement) {
        if (waitForElement === void 0) { waitForElement = AppiumDriver.defaultWaitTime; }
        var shouldMatch = match == 'exact' ? true : false;
        return this.findElementByXPath(elementHelper.getXPathByText(text, shouldMatch, this._runType), waitForElement);
    };
    AppiumDriver.prototype.click = function () {
        return this._driver.click();
    };
    AppiumDriver.prototype.tap = function () {
        return this._driver.tap();
    };
    AppiumDriver.prototype.quit = function () {
        return this._driver.quit();
    };
    AppiumDriver.prototype.driver = function () {
        return this._driver;
    };
    AppiumDriver.defaultWaitTime = 5000;
    return AppiumDriver;
}());
exports.AppiumDriver = AppiumDriver;
