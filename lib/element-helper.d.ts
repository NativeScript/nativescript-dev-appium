import { INsCapabilities } from "./interfaces/ns-capabilities";
export declare class ElementHelper {
    private _args;
    private locators;
    constructor(_args: INsCapabilities);
    getXPathElement(name: any): void;
    getXPathByText(text: any, exactMatch: any): string;
    getXPathWithExactText(text: any): string;
    getXPathContainingText(text: any): string;
    findByTextLocator(controlType: any, value: any, exactMatch: any): string;
}
