const nsAppium = require("nativescript-dev-appium");

describe("sample scenario", () => {
    let driver;

    beforeAll(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 1200000;
        driver = await nsAppium.createDriver();
    });

    afterAll(async () => {
        await driver.quit();
        console.log("Quit driver!");
    });

    afterEach(async function () {
        await driver.logTestArtifacts("failure");
    });

    it("should find Welcome message", async () => {
        const label = await driver.findElementByText("Welcome", "contains");
        expect(await label.isDisplayed()).toBeTruthy();
    });
});