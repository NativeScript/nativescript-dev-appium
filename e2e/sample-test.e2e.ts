const nsAppium = require("nativescript-dev-appium");

describe("scenario simple", () => {
    const defaultWaitTime = 5000;
    let driver;

    before(async () => {
        driver = nsAppium.createDriver();
    });

    after(async () => {
        await driver.quit();
        console.log("Driver quits!");
    });

    it("should find an element", async () => {
        const tapButtonLocator = nsAppium.getXPathWithExactText("TAP");
        const tapButton = await driver.waitForElementByXPath(tapButtonLocator, defaultWaitTime);
        await tapButton.click();
        const messageLabel = await driver.waitForElementByXPath(nsAppium.getXPathContainingsText("41 taps left"), defaultWaitTime);
        console.log(await messageLabel.text());
    });
});