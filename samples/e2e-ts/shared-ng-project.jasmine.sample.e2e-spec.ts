import { AppiumDriver, createDriver, SearchOptions } from "nativescript-dev-appium";

describe("sample scenario", () => {
    let driver: AppiumDriver;

    beforeAll(async () => {
        driver = await createDriver();
    });

    afterAll(async () => {
        await driver.quit();
        console.log("Quit driver!");
    });

    afterEach(async function () {
        await driver.logTestArtifacts("report");
    });

    it("should find an element by text", async () => {
        const btnTap = await driver.findElementByAutomationText("TAP");
        await btnTap.click();

        const message = " taps left";
        const lblMessage = await driver.findElementByText(message, SearchOptions.contains);
        expect(await lblMessage.text()).toContain("41");
        // Image verification
        // const screen = await driver.compareScreen("hello-world-41");
        // assert.isTrue(screen);
        // expect(screen).toBeTruthy();
    });

    it("should find an element by type", async () => {
        const btnTap = await driver.findElementByClassName(driver.locators.button);
        await btnTap.click();

        const message = " taps left";
        const lblMessage = await driver.findElementByText(message, SearchOptions.contains);
        expect(await lblMessage.text()).toContain("40");
    });
});