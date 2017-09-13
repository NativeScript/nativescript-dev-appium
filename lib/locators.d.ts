export declare class Locator {
    private _platformName;
    private _platformVersion;
    private _elementsList;
    constructor(_platformName: string, _platformVersion: any);
    readonly button: string;
    readonly listView: string;
    readonly image: string;
    readonly allELementsList: Map<string, string>;
    getElementByName(name: any): string;
    private loadAndroidElements();
    private loadIOSElements();
    private createIosElement(element);
}
