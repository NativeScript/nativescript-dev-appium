import { contains } from "./utils";
import { log } from "./utils";

export class ElementHelper {

    private isAndroid: boolean;
    constructor(private platform: string, private platformVersion: number) {
        this.isAndroid = this.platform === "android";
    }

    public getXPathElement(name) {
        const tempName = name.toLowerCase().replace(/\-/g, "");
        if (this.isAndroid) {
            return "//*/" + this.getAndroidClass(tempName);
        } else {
            return "//*/" + this.getiOSClassByName(tempName, this.platformVersion);
        }
    };

    public getElementClass(name) {
        const tempName = name.toLowerCase().replace(/\-/g, "");
        if (this.isAndroid) {
            return this.getAndroidClass(tempName);
        } else {
            return this.getiOSClassByName(tempName, this.platformVersion);
        }
    }

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

    public getAndroidClass(name) {
        switch (name) {
            case "activityindicator":
                return "android.widget.ProgressBar";
            case "button":
                return "android.widget.Button";
            case "image-button":
            case "imagebutton":
                return "android.widget.ImageButton";
            case "datepicker":
                return "android.widget.DatePicker";
            case "htmlview":
                return "android.widget.TextView";
            case "image":
                return "org.nativescript.widgets.ImageView";
            case "label":
                return "android.widget.TextView";
            case "absolutelayout":
                return "android.view.View";
            case "docklayout":
                return "android.view.View";
            case "gridlayout":
                return "android.view.View";
            case "stacklayout":
                return "android.view.View";
            case "wraplayout":
                return "android.view.View";
            case "listpicker":
                return "android.widget.NumberPicker";
            case "listview":
                return "android.widget.ListView";
            case "progress":
                return "android.widget.ProgressBar";
            case "scrollview":
                return "android.view.View";
            case "hscrollview":
                return "org.nativescript.widgets.HorizontalScrollView";
            case "vscrollview":
                return "org.nativescript.widgets.VerticalScrollView";
            case "searchbar":
                return "android.widget.SearchView";
            case "segmentedbar":
                return "android.widget.TabHost";
            case "slider":
                return "android.widget.SeekBar";
            case "switch":
                return "android.widget.Switch";
            case "tabview":
                return "android.support.v4.view.ViewPager";
            case "textview":
            case "securetextfield":
            case "textfield":
                return "android.widget.EditText";
            case "timepicker":
                return "android.widget.TimePicker";
            case "webview":
                return "android.webkit.WebView";
        }

        throw new Error("This " + name + " does not appear to to be a standard NativeScript UI component.");
    }

    private getiOSClassByName(name, caps) {
        switch (name) {
            case "activityindicator":
                return this.createIosElement("ActivityIndicator");
            case "button":
            case "image-button":
            case "imagebutton":
                return this.createIosElement("Button");
            case "datepicker":
                return this.createIosElement("DatePicker");
            case "htmlview":
                return this.createIosElement("TextView");
            case "image":
                return this.createIosElement("ImageView");
            case "label":
                return this.createIosElement("StaticText");
            case "absolutelayout":
                return this.createIosElement("View");
            case "docklayout":
                return this.createIosElement("View");
            case "gridlayout":
                return this.createIosElement("View");
            case "stacklayout":
                return this.createIosElement("View");
            case "wraplayout":
                return this.createIosElement("View");
            case "listpicker":
                return this.createIosElement("Picker");
            case "listview":
                return this.createIosElement("Table");
            case "progress":
                return this.createIosElement("ProgressIndicator");
            case "scrollview":
                return this.createIosElement("ScrollView");
            case "hscrollview":
                return this.createIosElement("ScrollView");
            case "vscrollview":
                return this.createIosElement("ScrollView");
            case "searchbar":
                return this.createIosElement("SearchField");
            case "segmentedbar":
                return this.createIosElement("SegmentedControl");
            case "slider":
                return this.createIosElement("Slider");
            case "switch":
                return this.createIosElement("Switch");
            case "tabview":
                return "XCUIElementTypeTabBarItem";
            case "textview":
                return this.createIosElement("TextView");
            case "textfield":
                return this.createIosElement("TextField");
            case "securetextfield":
                return this.createIosElement("SecureTextField");
            case "timepicker":
                return this.createIosElement("DatePicker");
            case "webview":
                return this.createIosElement("WebView");
        }

        throw new Error("This " + name + " does not appear to to be a standard NativeScript UI component.");
    }

    private createIosElement(element) {
        let elementType = "UIA";
        if (contains(this.platformVersion, "10")) {
            elementType = "XCUIElementType";
        }

        return elementType + element;
    }
}