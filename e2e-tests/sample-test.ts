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
        const tapButtonLocator = nsAppium.getXPathByText("TAP");
        const tapButton = await driver.waitForElementByXPath(tapButtonLocator, defaultWaitTime);
        await tapButton.tap();
        const messageLabel = await driver.waitForElementByXPath(nsAppium.getXPathByText("41 taps left"), defaultWaitTime);
        console.log(await messageLabel.text().should);
    });
});