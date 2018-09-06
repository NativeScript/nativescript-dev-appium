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
        const btnTap = await driver.findElementByText("TAP", nsAppium.SearchOptions.exact);
        await btnTap.click();

        const message = " taps left";
        const lblMessage = await driver.findElementByText(message, nsAppium.SearchOptions.contains);
        assert.equal(await lblMessage.text(), "41" + message);

        // Image verification
        // const screen = await driver.compareScreen("hello-world-41");
        // assert.isTrue(screen);
    });

    it("should find an element by type", async () => {
        const btnTap = await driver.findElementByClassName(driver.locators.button);
        await btnTap.click();

        const message = " taps left";
        const lblMessage = await driver.findElementByText(message, nsAppium.SearchOptions.contains);
        assert.equal(await lblMessage.text(), "40" + message);
    });
});