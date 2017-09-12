import { INsCapabilities } from "./ins-capabilities";
export declare class Locator {
    private _args;
    private _elementsList;
    constructor(_args: INsCapabilities);
    readonly button: string;
    readonly listView: string;
    readonly allELementsList: Map<string, string>;
    private getElementByName(name);
    private loadAndroidElements();
    private loadIOSElements();
    private createIosElement(element);
}
