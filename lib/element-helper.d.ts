export declare class ElementHelper {
    private _platform;
    private _platformVersion;
    private locators;
    private isAndroid;
    constructor(_platform: string, _platformVersion: number);
    getXPathElement(name: any): void;
    getXPathByText(text: any, exactMatch: any): string;
    getXPathWithExactText(text: any): string;
    getXPathContainingText(text: any): string;
    findByTextLocator(controlType: any, value: any, exactMatch: any): string;
}
