import { AppiumDriver, createDriver, SearchOptions } from "nativescript-dev-appium";
import { assert } from "chai";

describe("scenario simple", () => {
    const defaultWaitTime = 5000;
    let driver: AppiumDriver;

    before(async () => {
        driver = await createDriver();
    });

    after(async () => {
        await driver.quit();
        console.log("Driver quits!");
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logScreenshoot(this.currentTest.title);
        }
    });

    it("should find an element by text", async () => {
        const tapButton = await driver.findElementByText("TAP");
        await tapButton.click();
        const displayMsg = "41 taps left";
        const messageLabel = await driver.findElementByText(displayMsg, SearchOptions.contains);
        assert.equal(await messageLabel.text(), displayMsg, "You have a problem. Probably the binding is not working!");
    });

    it("should find an element by type", async () => {
        // case insesitive search by text for android
        const tapButton = await driver.findElementByText("tap");
        await tapButton.click();
        const messageLabel = await driver.findElementByText("40 taps left", SearchOptions.contains);
        const isDisplayMessageCorrect = await driver.compareScreen("hello-world-display.png", 10, 0.01);
        assert.isTrue(isDisplayMessageCorrect, "Look at hello-world-display-diif.png");
    });
});