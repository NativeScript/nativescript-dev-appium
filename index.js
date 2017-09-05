"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var portastic = require("portastic");
var appium_server_1 = require("./lib/appium-server");
var appium_driver_1 = require("./lib/appium-driver");
var element_helper_1 = require("./lib/element-helper");
var ns_capabilities_1 = require("./lib/ns-capabilities");
var appium_driver_2 = require("./lib/appium-driver");
exports.AppiumDriver = appium_driver_2.AppiumDriver;
var element_helper_2 = require("./lib/element-helper");
exports.ElementHelper = element_helper_2.ElementHelper;
var ui_element_1 = require("./lib/ui-element");
exports.UIElement = ui_element_1.UIElement;
var point_1 = require("./lib/point");
exports.Point = point_1.Point;
var nsCapabilities = new ns_capabilities_1.NsCapabilities();
var server = new appium_server_1.AppiumServer(nsCapabilities);
function startServer(port) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    server.port = port || nsCapabilities.port;
                    if (!!port) return [3 /*break*/, 2];
                    _a = server;
                    return [4 /*yield*/, portastic.find({ min: 8600, max: 9080 })];
                case 1:
                    _a.port = (_b.sent())[0];
                    _b.label = 2;
                case 2: return [4 /*yield*/, server.start()];
                case 3: return [2 /*return*/, _b.sent()];
            }
        });
    });
}
exports.startServer = startServer;
;
function stopServer() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, server.stop()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.stopServer = stopServer;
;
function createDriver() {
    if (!nsCapabilities.appiumCapsLocation) {
        throw new Error("Provided path to appium capabilities is not correct!");
    }
    if (!nsCapabilities.runType) {
        throw new Error("--runType is missing! Make sure it is provided correctly! It is used to parse the configuration for appium driver!");
    }
    return appium_driver_1.createAppiumDriver(server.port, nsCapabilities);
}
exports.createDriver = createDriver;
;
function elementHelper() {
    return new element_helper_1.ElementHelper(nsCapabilities.appiumCaps.platformName.toLowerCase(), nsCapabilities.appiumCaps.platformVersion.toLowerCase());
}
exports.elementHelper = elementHelper;
//# sourceMappingURL=index.js.map