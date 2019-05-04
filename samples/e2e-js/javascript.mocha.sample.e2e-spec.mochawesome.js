const nsAppium = require("nativescript-dev-appium");
const assert = require("chai").assert;
const addContext = require('mochawesome/addContext');

describe("sample scenario", () => {
    let driver;

    before(async function () {
        nsAppium.nsCapabilities.testReporter.context = this;
        driver = await nsAppium.createDriver();
    });

    after(async function () {
        await driver.quit();
        console.log("Quit driver!");
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
        }
    });

    it("should find an element by text", async function () {
        const btnTap = await driver.findElementByAutomationText("TAP");
        await btnTap.click();

        const message = " taps left";
        const lblMessage = await driver.findElementByText(message, nsAppium.SearchOptions.contains);
        assert.equal(await lblMessage.text(), "41" + message);

        // Image verification
        // const screen = await driver.compareScreen("hello-world-41");
        // assert.isTrue(screen);
    });

    it("should find an element by type", async function () {
        const btnTap = await driver.findElementByClassName(driver.locators.button);
        await btnTap.click();

        const message = " taps left";
        const lblMessage = await driver.findElementByText(message, nsAppium.SearchOptions.contains);
        assert.equal(await lblMessage.text(), "40" + message);
    });
});