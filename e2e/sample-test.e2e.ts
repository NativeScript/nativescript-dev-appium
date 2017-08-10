import { AppiumDriver, createDriver } from "nativescript-dev-appium";

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

    it("should find an element", async () => {
        const tapButton = await driver.findElementByText("TAP", "exact");
        await tapButton.click();
        const messageLabel = await driver.findElementByText("41 taps left", "exact");
        console.log(await messageLabel.text());
    });
});