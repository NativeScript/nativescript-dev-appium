import { INsCapabilities } from "./interfaces/ns-capabilities";
export declare class Locator {
    private _args;
    private _elementsList;
    constructor(_args: INsCapabilities);
    readonly button: string;
    readonly label: string;
    readonly getXPathByTextAtributes: string;
    readonly image: string;
    readonly activityIndicator: string;
    readonly listView: string;
    readonly locators: Map<string, string>;
    getElementByName(name: any): string;
    private loadAndroidElements;
    private loadIOSElements;
    private createIosElement;
}
