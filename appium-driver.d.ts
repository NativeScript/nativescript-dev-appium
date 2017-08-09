export declare class AppiumDriver {
    private _driver;
    private _runType;
    private static defaultWaitTime;
    constructor(_driver: any, _runType: string);
    findElementByXPath(xPath: string, waitForElement?: number): any;
    findElementByText(text: string, match: 'exact' | 'contains', waitForElement?: number): any;
    click(): any;
    tap(): any;
    quit(): any;
    driver(): any;
}
