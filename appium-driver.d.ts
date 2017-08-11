export declare var should: any;
export declare function createAppiumDriver(runType: string, port: number, caps: any, isSauceLab?: boolean): AppiumDriver;
export declare class AppiumDriver {
    private _driver;
    private _runType;
    private _port;
    private caps;
    private _isSauceLab;
    private _capsLocation;
    private static defaultWaitTime;
    private elementHelper;
    constructor(_driver: any, _runType: string, _port: number, caps: any, _isSauceLab?: boolean, _capsLocation?: string);
    readonly capabilities: any;
    readonly platformName: any;
    readonly platformVesrion: any;
    readonly driver: any;
    findElementByXPath(xPath: string, waitForElement?: number): any;
    findElementsByXPath(xPath: string, waitForElement?: number): any;
    findElementByText(text: string, match: 'exact' | 'contains', waitForElement?: number): any;
    click(): any;
    tap(): any;
    quit(): any;
}
