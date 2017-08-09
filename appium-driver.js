"use strict";
exports.__esModule = true;
var elementHelper = require("./element-finder");
var AppiumDriver = (function () {
    function AppiumDriver(_driver, _runType) {
        this._driver = _driver;
        this._runType = _runType;
    }
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
