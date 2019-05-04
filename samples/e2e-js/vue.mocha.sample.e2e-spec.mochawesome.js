const nsAppium = require("nativescript-dev-appium");
const assert = require("chai").assert;
const addContext = require('mochawesome/addContext');

describe("sample scenario", () => {
    let driver;

    before(async function() {
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
        const label = await driver.findElementByText("Welcome", "contains");
        assert.isTrue(await label.isDisplayed());
    });
});