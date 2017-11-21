import { contains } from "./utils";
import { log } from "./utils";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { Locator } from "./locators";

export class ElementHelper {

    private locators: Locator;

    constructor(private _args: INsCapabilities) {
        this.locators = new Locator(this._args)
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
        if (this._args.isAndroid) {
            artbutes = ["content-desc", "resource-id", "text"];
        }

        let searchedString = "";
        if (exactMatch) {
            if (this._args.isAndroid) {
                artbutes.forEach((atr) => { searchedString += "translate(@" + atr + ",'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='" + value.toLowerCase() + "'" + " or " });
            } else {
                artbutes.forEach((atr) => { searchedString += "@" + atr + "='" + value + "'" + " or " });
            }
        } else {
            if (this._args.isAndroid) {
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