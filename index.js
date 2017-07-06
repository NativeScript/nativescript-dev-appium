require("./appium-setup");
var glob = require("glob");

var testRunType = process.env.npm_config_runType;
var isSauceLab = process.env.npm_config_sauceLab;
var appLocation = process.env.npm_config_appLocation;
var wd = require("wd");
var capability;
var customCapabilitiesList = process.env.APPIUM_CAPABILITIES;
var customCapabilities;

if (customCapabilitiesList) {
    customCapabilities = JSON.parse(customCapabilitiesList)
} else {
    throw new Error("No capabilities provided!!!");
}

exports.createDriver = function (caps, activityName) {
    if (!activityName) {
        activityName = "com.tns.NativeScriptActivity";
    }

    if (!caps) {
        caps = customCapabilities[testRunType];
        if (!caps) {
            throw new Error("Incorrect test run type: " + testRunType + " . Available run types are :" + customCapabilitiesList);
        }
    }

    var localServerConfig = {
        host: "localhost",
        port: process.env.APPIUM_PORT || 4723
    };

    var config = localServerConfig;
    var sauceLabConfig;

    if (isSauceLab) {
        var sauceUser = process.env.SAUCE_USER;
        var sauceKey = process.env.SAUCE_KEY;

        if (!sauceKey || !sauceUser) {
            throw new Error("Sauce Labs Username or Access Key is missing! Check environment variables for SAUCE_USER and SAUCE_KEY !!!");
        }

        sauceLabConfig = "https://" + sauceUser + ":" + sauceKey + "@ondemand.saucelabs.com:443/wd/hub";
        config = sauceLabConfig;
    }

    var driver = wd.promiseChainRemote(config);
    exports.configureLogging(driver);

    if (appLocation) {
        caps.app = isSauceLab ? "sauce-storage:" + appLocation : appLocation;
    }
    else if (!caps.app) {
        console.log("Getting caps.app!");
        caps.app = exports.getAppPath();
    }

    capability = caps;
    console.log("Creating driver!");
    return driver.init(caps);
};

exports.getAppPath = function () {
    console.log("testRunType " + testRunType);
    if (testRunType.includes("android")) {
        var apks = glob.sync("platforms/android/build/outputs/apk/*.apk").filter(function (file) { return file.indexOf("unaligned") < 0; });
        return apks[0];
    } else if (testRunType.includes("ios-simulator")) {
        var simulatorApps = glob.sync("platforms/ios/build/emulator/**/*.app");
        return simulatorApps[0];
    } else if (testRunType.includes("ios-device")) {
        var deviceApps = glob.sync("platforms/ios/build/device/**/*.ipa");
        return deviceApps[0];
    } else {
        throw new Error("No 'app' capability provided and incorrect 'runType' convention used: " + testRunType +
         ". In order to automatically search and locate app package please use 'android','ios-device','ios-simulator' in your 'runType' option. E.g --runType=android23, --runType=ios-simulator10iPhone6");
    }
};

function log(message) {
    if (process.env.VERBOSE_LOG) {
        console.log(message);
    }
}

exports.configureLogging = function (driver) {
    driver.on("status", function (info) {
        log(info.cyan);
    });
    driver.on("command", function (meth, path, data) {
        log(" > " + meth.yellow + path.grey + " " + (data || ""));
    });
    driver.on("http", function (meth, path, data) {
        log(" > " + meth.magenta + path + " " + (data || "").grey);
    });
};

exports.getXPathElement = function (name) {
    var tempName = name.toLowerCase().replace(/\-/g, "");
    if (testRunType.includes("android")) {
        return xpathAndroid(tempName);
    } else {
        return xpathiOS(tempName);
    }
};

function xpathAndroid(name) {
    switch (name) {
        case "activityindicator": return "android.widget.ProgressBar";
        case "button": return "android.widget.Button";
        case "datepicker": return "android.widget.DatePicker";
        case "htmlview": return "android.widget.TextView";
        case "image": return "org.nativescript.widgets.ImageView";
        case "label": return "android.widget.TextView";
        case "absolutelayout": return "android.view.View";
        case "docklayout": return "android.view.View";
        case "gridlayout": return "android.view.View";
        case "stacklayout": return "android.view.View";
        case "wraplayout": return "android.view.View";
        case "listpicker": return "android.widget.NumberPicker";
        case "listview": return "android.widget.ListView";
        case "progress": return "android.widget.ProgressBar";
        case "scrollview": return "android.view.View";
        case "hscrollview": return "org.nativescript.widgets.HorizontalScrollView";
        case "vscrollview": return "org.nativescript.widgets.VerticalScrollView";
        case "searchbar": return "android.widget.SearchView";
        case "segmentedbar": return "android.widget.TabHost";
        case "slider": return "android.widget.SeekBar";
        case "switch": return "android.widget.Switch";
        case "tabview": return "android.support.v4.view.ViewPager";
        case "textview":
        case "securetextfield":
        case "textfield": return "android.widget.EditText";
        case "timepicker": return "android.widget.TimePicker";
        case "webview": return "android.webkit.WebView";
    }

    throw new Error("This " + name + " does not appear to to be a standard NativeScript UI component.");
}

function xpathiOS(name) {
    switch (name) {
        case "activityindicator": return createIosElement("ActivityIndicator");
        case "button": return createIosElement("Button");
        case "datepicker": return createIosElement("DatePicker");
        case "htmlview": return createIosElement("TextView");
        case "image": return createIosElement("ImageView");
        case "label": return createIosElement("StaticText");
        case "absolutelayout": return createIosElement("View");
        case "docklayout": return createIosElement("View");
        case "gridlayout": return createIosElement("View");
        case "stacklayout": return createIosElement("View");
        case "wraplayout": return createIosElement("View");
        case "listpicker": return createIosElement("Picker");
        case "listview": return createIosElement("Table");
        case "progress": return createIosElement("ProgressIndicator");
        case "scrollview": return createIosElement("ScrollView");
        case "hscrollview": return createIosElement("ScrollView");
        case "vscrollview": return createIosElement("ScrollView");
        case "searchbar": return createIosElement("SearchField");
        case "segmentedbar": return createIosElement("SegmentedControl");
        case "slider": return createIosElement("Slider");
        case "switch": return createIosElement("Switch");
        case "tabview": return "XCUIElementTypeTabBarItem";
        case "textview": return createIosElement("TextView");
        case "textfield": return createIosElement("TextField");
        case "securetextfield": return createIosElement("SecureTextField");
        case "timepicker": return createIosElement("DatePicker");
        case "webview": return createIosElement("WebView");
    }

    throw new Error("This " + name + " does not appear to to be a standard NativeScript UI component.");
}

function createIosElement(element) {
    let xCUIElementType = "XCUIElementType";
    let uIA = "UIA";
    let elementType;
    if (capability.platformVersion.includes("10")) {
        elementType = xCUIElementType;
    } else {
        elementType = uIA;
    }

    return elementType + element;
}

