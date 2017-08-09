"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var elementHelper = require("./element-finder");
var AppiumDriver = (function () {
    function AppiumDriver(_driver, _runType) {
        this._driver = _driver;
        this._runType = _runType;
    }
    AppiumDriver.prototype.findElementByXPath = function (xPath, waitForElement) {
        if (waitForElement === void 0) { waitForElement = AppiumDriver.defaultWaitTime; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._driver.waitForElementByXPath(xPath, waitForElement)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AppiumDriver.prototype.findElementByText = function (text, match, waitForElement) {
        if (waitForElement === void 0) { waitForElement = AppiumDriver.defaultWaitTime; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var shouldMatch;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shouldMatch = match == 'exact' ? true : false;
                        return [4 /*yield*/, this.findElementByXPath(elementHelper.getXPathByText(text, shouldMatch, this._runType), waitForElement)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AppiumDriver.prototype.click = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._driver.click()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AppiumDriver.prototype.tap = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._driver.tap()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AppiumDriver.prototype.quit = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._driver.quit()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AppiumDriver.prototype.driver = function () {
        return this._driver;
    };
    return AppiumDriver;
}());
AppiumDriver.defaultWaitTime = 5000;
exports.AppiumDriver = AppiumDriver;
//# sourceMappingURL=appium-driver.js.map