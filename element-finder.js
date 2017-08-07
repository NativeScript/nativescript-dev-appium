exports.getXPathElement = (name, testRunType) => {
    const tempName = name.toLowerCase().replace(/\-/g, "");
    if (testRunType.includes("android")) {
        return getAndroidClass(tempName);
    } else {
        return getiOSClassByName(tempName);
    }
};

exports.getXPathByText = (text, exactMatch, testRunType) => {
    return findByTextLocator("*", text, exactMatch, testRunType);
}

function findByTextLocator(controlType, value, exactMatch, testRunType) {
    console.log("Should be exact match: " + exactMatch);
    let artbutes = ["label", "value", "hint"];
    if (testRunType.includes("android")) {
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

function getiOSClassByName(name) {
    switch (name) {
        case "activityindicator":
            return createIosElement("ActivityIndicator");
        case "button":
            return createIosElement("Button");
        case "datepicker":
            return createIosElement("DatePicker");
        case "htmlview":
            return createIosElement("TextView");
        case "image":
            return createIosElement("ImageView");
        case "label":
            return createIosElement("StaticText");
        case "absolutelayout":
            return createIosElement("View");
        case "docklayout":
            return createIosElement("View");
        case "gridlayout":
            return createIosElement("View");
        case "stacklayout":
            return createIosElement("View");
        case "wraplayout":
            return createIosElement("View");
        case "listpicker":
            return createIosElement("Picker");
        case "listview":
            return createIosElement("Table");
        case "progress":
            return createIosElement("ProgressIndicator");
        case "scrollview":
            return createIosElement("ScrollView");
        case "hscrollview":
            return createIosElement("ScrollView");
        case "vscrollview":
            return createIosElement("ScrollView");
        case "searchbar":
            return createIosElement("SearchField");
        case "segmentedbar":
            return createIosElement("SegmentedControl");
        case "slider":
            return createIosElement("Slider");
        case "switch":
            return createIosElement("Switch");
        case "tabview":
            return "XCUIElementTypeTabBarItem";
        case "textview":
            return createIosElement("TextView");
        case "textfield":
            return createIosElement("TextField");
        case "securetextfield":
            return createIosElement("SecureTextField");
        case "timepicker":
            return createIosElement("DatePicker");
        case "webview":
            return createIosElement("WebView");
    }

    throw new Error("This " + name + " does not appear to to be a standard NativeScript UI component.");
}

function createIosElement(element) {
    let elementType = "UIA";
    if (caps.platformVersion.includes("10")) {
        elementType = "XCUIElementType";
    }

    return elementType + element;
}