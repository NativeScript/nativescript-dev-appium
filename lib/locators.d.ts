import { INsCapabilities } from "./ins-capabilities";
export declare class Locator {
    private _args;
    private _elementsList;
    constructor(_args: INsCapabilities);
    readonly button: boolean;
    readonly allELementsList: Map<string, string>;
    private getElementByName(name);
    private loadAndroidClasses();
    private loadIOSClassByName();
    private createIosElement(element);
}
