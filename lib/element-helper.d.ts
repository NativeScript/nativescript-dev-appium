import { INsCapabilities } from "./interfaces/ns-capabilities";
export declare class ElementHelper {
    private _args;
    private locators;
    constructor(_args: INsCapabilities);
    getXPathElement(name: any): string;
    getXPathByText(text: any, exactMatch: any): string;
    getXPathWithExactText(text: any): string;
    getXPathContainingText(text: any): string;
    findByTextLocator(controlType: any, value: any, exactMatch: any): string;
    getXPathByTextAtributes(controlType: any, textValue: any, exactMatch: any): string;
}
