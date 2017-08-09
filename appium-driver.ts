import * as elementHelper from "./element-finder";

export class AppiumDriver {
    private static defaultWaitTime: number = 5000;
    constructor(private _driver: any, private _runType: string) {
    }

    public async findElementByXPath(xPath: string, waitForElement: number = AppiumDriver.defaultWaitTime) {
        return await this._driver.waitForElementByXPath(xPath, waitForElement);
    }

    public async findElementByText(text: string, match: 'exact' | 'contains', waitForElement: number = AppiumDriver.defaultWaitTime) {
        const shouldMatch = match == 'exact' ? true : false;
        return await this.findElementByXPath(elementHelper.getXPathByText(text, shouldMatch, this._runType), waitForElement);
    }

    public async click() {
        return await this._driver.click();
    }

    public async tap() {
        return await this._driver.tap();
    }

    public async quit() {
        return await this._driver.quit();
    }

    public driver() {
        return this._driver;
    }
}