"use strict";
var nsAppium = require("nativescript-dev-appium");

describe("android simple", function () {
    this.timeout(10000);
    var driver;

    before(function () {
        driver = nsAppium.createDriver();
    });

    after(function () {
        return driver
        .quit()
        .finally(function () {
            console.log("Driver quit successfully");
        });
    });

    it("should find an element", function () {
        return driver
            .elementByAccessibilityId("tapButton")
                .should.eventually.exist
            .tap()
            .elementByAccessibilityId("messageLabel")
                .text().should.eventually.equal("41 taps left")
    });
});
