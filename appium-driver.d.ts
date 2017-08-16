export declare var should: any;
import { SearchOptions } from "./search-options";
import { UIElement } from "./ui-element";
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
    navBack(): Promise<any>;
    findElementByXPath(xPath: string, waitForElement?: number): Promise<UIElement>;
    findElementsByXPath(xPath: string, waitForElement?: number): Promise<any>;
    findElementByText(text: string, match?: SearchOptions, waitForElement?: number): Promise<UIElement>;
    findElementsByText(text: string, match?: SearchOptions, waitForElement?: number): Promise<any>;
    findElementsByClassName(className: string, waitForElement?: number): Promise<any>;
    takeScreenshot(fileName: string): any;
    quit(): Promise<void>;
}
