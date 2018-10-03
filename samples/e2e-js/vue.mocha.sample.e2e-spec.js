const nsAppium = require("nativescript-dev-appium");
const assert = require("chai").assert;

describe("sample scenario", () => {
    const defaultWaitTime = 5000;
    let driver;

    before(async () => {
        driver = await nsAppium.createDriver();
    });

    after(async () => {
        await driver.quit();
        console.log("Quit driver!");
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
        }
    });

    it("should find an element by text", async () => {
        const label = await driver.findElementByText("Welcome", nsAppium.SearchOptions.contains);
        assert.equal(await label.isDisplayed(), "41" + message);
    });
});