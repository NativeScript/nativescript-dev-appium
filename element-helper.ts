import { contains } from "./utils";

export class ElementHelper {

    constructor(private runType: string) { }

    public getXPathElement(name) {
        const tempName = name.toLowerCase().replace(/\-/g, "");
        if (contains(this.runType, "android")) {
            return this.getAndroidClass(tempName);
        } else {
            return this.getiOSClassByName(tempName, this.runType);
        }
    };

    public getElementClass(name) {
        const tempName = name.toLowerCase().replace(/\-/g, "");
        if (contains(this.runType, "android")) {
            return this.getAndroidClass(tempName);
        } else {
            return this.getiOSClassByName(tempName, this.runType);
        }
    }

    public getXPathByText(text, exactMatch, testRunType) {
        return this.findByTextLocator("*", text, exactMatch);
    }

    public getXPathWithExactText(text) {
        return this.getXPathByText(text, true, this.runType);
    }

    public getXPathContainingText(text) {
        return this.getXPathByText(text, false, this.runType);
    }

    public findByTextLocator(controlType, value, exactMatch) {
        console.log("Should be exact match: " + exactMatch);
        let artbutes = ["label", "value", "hint"];
        if (contains(this.runType, "android")) {
            artbutes = ["content-desc", "resource-id", "text"];
        }

        let searchedString = "";
        if (exactMatch) {
            artbutes.forEach((atr) => { searchedString += "@" + atr + "='" + value + "'" + " or " });
        } else {
            artbutes.forEach((atr) => { searchedString += "contains(@" + atr + ",'" + value + "')" + " or " });
        }

        searchedString = searchedString.substring(0, searchedString.lastIndexOf(" or "));
        const result = "//" + controlType + "[" + searchedString + "]";
        console.log("Xpath: " + result);

        return result;
    }

    public getAndroidClass(name) {
        switch (name) {
            case "activityindicator":
                return "android.widget.ProgressBar";
            case "button":
                return "android.widget.Button";
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
                return this.createIosElement("ActivityIndicator", caps);
            case "button":
                return this.createIosElement("Button", caps);
            case "datepicker":
                return this.createIosElement("DatePicker", caps);
            case "htmlview":
                return this.createIosElement("TextView", caps);
            case "image":
                return this.createIosElement("ImageView", caps);
            case "label":
                return this.createIosElement("StaticText", caps);
            case "absolutelayout":
                return this.createIosElement("View", caps);
            case "docklayout":
                return this.createIosElement("View", caps);
            case "gridlayout":
                return this.createIosElement("View", caps);
            case "stacklayout":
                return this.createIosElement("View", caps);
            case "wraplayout":
                return this.createIosElement("View", caps);
            case "listpicker":
                return this.createIosElement("Picker", caps);
            case "listview":
                return this.createIosElement("Table", caps);
            case "progress":
                return this.createIosElement("ProgressIndicator", caps);
            case "scrollview":
                return this.createIosElement("ScrollView", caps);
            case "hscrollview":
                return this.createIosElement("ScrollView", caps);
            case "vscrollview":
                return this.createIosElement("ScrollView", caps);
            case "searchbar":
                return this.createIosElement("SearchField", caps);
            case "segmentedbar":
                return this.createIosElement("SegmentedControl", caps);
            case "slider":
                return this.createIosElement("Slider", caps);
            case "switch":
                return this.createIosElement("Switch", caps);
            case "tabview":
                return "XCUIElementTypeTabBarItem";
            case "textview":
                return this.createIosElement("TextView", caps);
            case "textfield":
                return this.createIosElement("TextField", caps);
            case "securetextfield":
                return this.createIosElement("SecureTextField", caps);
            case "timepicker":
                return this.createIosElement("DatePicker", caps);
            case "webview":
                return this.createIosElement("WebView", caps);
        }

        throw new Error("This " + name + " does not appear to to be a standard NativeScript UI component.");
    }

    private createIosElement(element, caps) {
        let elementType = "UIA";
        if (contains(caps.platformVersion, "10")) {
            elementType = "XCUIElementType";
        }

        return elementType + element;
    }
}