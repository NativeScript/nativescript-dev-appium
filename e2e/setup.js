"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var setup = require("nativescript-dev-appium");
before("setup server", function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var port;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Setting up server");
                port = 9191;
                return [4 /*yield*/, setup.startAppiumServer(port)];
            case 1:
                _a.sent();
                console.log("Server is started");
                return [2 /*return*/];
        }
    });
}); });
before("setup driver", function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        console.log("Setting up driver");
        return [2 /*return*/];
    });
}); });
after("kill driver", function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        console.log("Kill driver");
        return [2 /*return*/];
    });
}); });
after("kill server", function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, setup.killAppiumServer()];
            case 1:
                _a.sent();
                console.log("Server stopped");
                return [2 /*return*/];
        }
    });
}); });
