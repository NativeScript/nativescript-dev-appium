require("./appium-setup");
var glob = require("glob");

var testRunType = process.env.TEST_RUN_TYPE;

var wd = require("wd");

exports.createDriver = function(caps, activityName) {
    if (!activityName) {
        activityName = "com.tns.NativeScriptActivity";
    }
    if (!caps) {
        caps = exports.getDefaultCapabilities();
    }

    var serverConfig = {
        host: "localhost",
        port: process.env.APPIUM_PORT || 4723
    };
    var driver = wd.promiseChainRemote(serverConfig);
    exports.configureLogging(driver);

    caps.app = exports.getAppPath();
    return driver.init(caps);
};

exports.getAppPath = function() {
    if (testRunType === "android") {
        var apks = glob.sync("platforms/android/build/outputs/apk/*.apk").filter(function(file) { return file.indexOf("unaligned") < 0; });

        return apks[0];
    } else if (testRunType === "ios-simulator") {
        var simulatorApps = glob.sync("platforms/ios/build/emulator/**/*.app");
        return simulatorApps[0];
    } else if (testRunType === "ios") {
        var deviceApps = glob.sync("platforms/ios/build/device/**/*.app");
        return deviceApps[0];
    } else {
        throw new Error("Incorrect test run type: " + testRunType);
    }
};

exports.getDefaultCapabilities = function() {
    if (testRunType === "android") {
        return exports.caps.android19();
    } else if (testRunType === "ios-simulator") {
        return exports.caps.ios10();
    } else if (testRunType === "ios") {
        return exports.caps.ios10();
    } else {
        throw new Error("Incorrect test run type: " + testRunType);
    }
};

function log(message) {
    if (process.env.VERBOSE_LOG) {
        console.log(message);
    }
}

exports.configureLogging = function(driver) {
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

exports.caps = {
    android19: function(){
        return {
            browserName: "",
            "appium-version": "1.6",
            platformName: "Android",
            platformVersion: "4.4.2",
            deviceName: "Android Emulator",
            noReset: false, //Always reinstall app
            app: undefined // will be set later
        };
    },
    ios92: function() {
        return {
            browserName: "",
            "appium-version": "1.6",
            platformName: "iOS",
            platformVersion: "9.2",
            deviceName: "iPhone 6",
            noReset: false, //Always reinstall app
            app: undefined // will be set later
        };
    },
    ios10: function() {
        return {
            browserName: "",
            "appium-version": "1.6",
            platformName: "iOS",
            platformVersion: "10.0",
            deviceName: "iPhone 6",
            noReset: false, //Always reinstall app
            app: undefined // will be set later
        };
    },
};

exports.getXPathElement = function(name) {
    var tempName = name.toLowerCase().replace(/\-/g, "");
    if (testRunType === "android") {
        return xpathAndroid(tempName, name);
    } else {
        return xpathiOS(tempName, name);
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
        case "textfield": return "android.widget.EditText";
        case "timepicker": return "android.widget.TimePicker";
        case "webview": return "android.webkit.WebView";
    }

    throw new Error("This "+name + " does not appear to to be a standard NativeScript UI component.");
}

function xpathiOS(name) {
    switch (name) {
        case "activityindicator": return "UIActivityIndicatorView";
        case "button": return "UIButton";
        case "datepicker": return "UIDatePicker";
        case "htmlview": return "UITextView";
        case "image": return "UIImageView";
        case "label": return "TNSLabel";
        case "absolutelayout": return "UIView";
        case "docklayout": return "UIView";
        case "gridlayout": return "UIView";
        case "stacklayout": return "UIView";
        case "wraplayout": return "UIView";
        case "listpicker": return "UIPickerView";
        case "listview": return "UITableView";
        case "progress": return "UIProgressView";
        case "scrollview":
        case "hscrollview":
        case "vscrollview": return "UIScrollView";
        case "searchbar": return "UISearchBar";
        case "segmentedbar": return "UISegmentedControl";
        case "slider": return "UISlider";
        case "switch": return "UISwitch";
        case "tabview": return "UITabBarItem";
        case "textview": return "UITextView";
        case "textfield": return "UITextField";
        case "timepicker": return "UIDatePicker";
        case "webview": return "UIWebView";
    }

    throw new Error("This " + name + " does not appear to to be a standard NativeScript UI component.");
}

