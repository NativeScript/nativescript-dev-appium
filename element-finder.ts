const utils = require("./utils");

export function getXPathElement(name, testRunType) {
    const tempName = name.toLowerCase().replace(/\-/g, "");
    if (utils.contains(testRunType, "android")) {
        return getAndroidClass(tempName);
    } else {
        return getiOSClassByName(tempName, testRunType);
    }
};

export function getElementClass(name, testRunType) {
    const tempName = name.toLowerCase().replace(/\-/g, "");
    if (utils.contains(testRunType, "android")) {
        return getAndroidClass(tempName);
    } else {
        return getiOSClassByName(tempName, testRunType);
    }
}

export function getXPathByText(text, exactMatch, testRunType) {
    return findByTextLocator("*", text, exactMatch, testRunType);
}

function findByTextLocator(controlType, value, exactMatch, testRunType) {
    console.log("Should be exact match: " + exactMatch);
    let artbutes = ["label", "value", "hint"];
    if (utils.contains(testRunType,"android")) {
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

function getAndroidClass(name) {
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

function getiOSClassByName(name, caps) {
    switch (name) {
        case "activityindicator":
            return createIosElement("ActivityIndicator", caps);
        case "button":
            return createIosElement("Button", caps);
        case "datepicker":
            return createIosElement("DatePicker", caps);
        case "htmlview":
            return createIosElement("TextView", caps);
        case "image":
            return createIosElement("ImageView", caps);
        case "label":
            return createIosElement("StaticText", caps);
        case "absolutelayout":
            return createIosElement("View", caps);
        case "docklayout":
            return createIosElement("View", caps);
        case "gridlayout":
            return createIosElement("View", caps);
        case "stacklayout":
            return createIosElement("View", caps);
        case "wraplayout":
            return createIosElement("View", caps);
        case "listpicker":
            return createIosElement("Picker", caps);
        case "listview":
            return createIosElement("Table", caps);
        case "progress":
            return createIosElement("ProgressIndicator", caps);
        case "scrollview":
            return createIosElement("ScrollView", caps);
        case "hscrollview":
            return createIosElement("ScrollView", caps);
        case "vscrollview":
            return createIosElement("ScrollView", caps);
        case "searchbar":
            return createIosElement("SearchField", caps);
        case "segmentedbar":
            return createIosElement("SegmentedControl", caps);
        case "slider":
            return createIosElement("Slider", caps);
        case "switch":
            return createIosElement("Switch", caps);
        case "tabview":
            return "XCUIElementTypeTabBarItem";
        case "textview":
            return createIosElement("TextView", caps);
        case "textfield":
            return createIosElement("TextField", caps);
        case "securetextfield":
            return createIosElement("SecureTextField", caps);
        case "timepicker":
            return createIosElement("DatePicker", caps);
        case "webview":
            return createIosElement("WebView", caps);
    }

    throw new Error("This " + name + " does not appear to to be a standard NativeScript UI component.");
}

function createIosElement(element, caps) {
    let elementType = "UIA";
    if (utils.contains(caps.platformVersion, "10")) {
        elementType = "XCUIElementType";
    }

    return elementType + element;
}