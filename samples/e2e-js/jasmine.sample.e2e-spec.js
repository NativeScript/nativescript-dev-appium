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

    it("should find an element by text", async () => {
        const btnTap = await driver.findElementByText("TAP", nsAppium.SearchOptions.exact);
        await btnTap.click();

        const message = " taps left";
        const lblMessage = await driver.findElementByText(message, nsAppium.SearchOptions.contains);
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
        const lblMessage = await driver.findElementByText(message, nsAppium.SearchOptions.contains);
        expect(await lblMessage.text()).toContain("40");
    });
});