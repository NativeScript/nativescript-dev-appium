import * as elementHelper from "./element-finder";

export class AppiumDriver {
    private static defaultWaitTime: number = 5000;
    constructor(private _driver: any, private _runType: string) {
    }

    public findElementByXPath(xPath: string, waitForElement: number = AppiumDriver.defaultWaitTime) {
        return this._driver.waitForElementByXPath(xPath, waitForElement);
    }

    public findElementByText(text: string, match: 'exact' | 'contains', waitForElement: number = AppiumDriver.defaultWaitTime) {
        const shouldMatch = match == 'exact' ? true : false;
        return this.findElementByXPath(elementHelper.getXPathByText(text, shouldMatch, this._runType), waitForElement);
    }

    public click() {
        return this._driver.click();
    }

    public tap() {
        return this._driver.tap();
    }

    public quit() {
        return this._driver.quit();
    }

    public driver() {
        return this._driver;
    }
}