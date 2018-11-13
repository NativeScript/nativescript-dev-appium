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
        const lblMessage = await driver.findElementByText("Welcome", SearchOptions.contains);
        expect(await lblMessage.isDisplayed());
        // Image verification
        // const screen = await driver.compareScreen("welcome_screen");
        // assert.isTrue(screen);
        // expect(screen).toBeTruthy();
    });
});