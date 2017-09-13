import { contains } from "./utils";
import { log } from "./utils";
import { Locator } from "./locators";

export class ElementHelper {

    private locators : Locator;

    private isAndroid: boolean;
    constructor(private _platform: string, private _platformVersion: number) {
        this.isAndroid = this._platform === "android";
        this.locators = new Locator(this._platform, this._platformVersion)
    }

    public getXPathElement(name) {
        const tempName = name.toLowerCase().replace(/\-/g, "");
        this.locators.getElementByName(name);
    };

    public getXPathByText(text, exactMatch) {
        return this.findByTextLocator("*", text, exactMatch);
    }

    public getXPathWithExactText(text) {
        return this.getXPathByText(text, true);
    }

    public getXPathContainingText(text) {
        return this.getXPathByText(text, false);
    }

    public findByTextLocator(controlType, value, exactMatch) {
        let artbutes = ["label", "value", "hint"];
        if (this.isAndroid) {
            artbutes = ["content-desc", "resource-id", "text"];
        }

        let searchedString = "";
        if (exactMatch) {
            if (this.isAndroid) {
                artbutes.forEach((atr) => { searchedString += "translate(@" + atr + ",'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='" + value.toLowerCase() + "'" + " or " });
            } else {
                artbutes.forEach((atr) => { searchedString += "@" + atr + "='" + value + "'" + " or " });
            }
        } else {
            if (this.isAndroid) {
                artbutes.forEach((atr) => { searchedString += "contains(translate(@" + atr + ",'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'" + value.toLowerCase() + "')" + " or " });
            } else {
                artbutes.forEach((atr) => { searchedString += "contains(@" + atr + ",'" + value + "')" + " or " });
            }
        }

        searchedString = searchedString.substring(0, searchedString.lastIndexOf(" or "));
        const result = "//" + controlType + "[" + searchedString + "]";
        log("Xpath: " + result, false);

        return result;
    }
}