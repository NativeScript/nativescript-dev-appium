require("./appium-setup");
var path = require("path");

var projectDir = path.dirname(path.dirname(__dirname));
var appId = require(path.join(projectDir, "package.json")).nativescript.id;

var wd = require("wd");

exports.createDriver = function(caps, activityName) {
    if (!activityName) {
        activityName = "com.tns.NativeScriptActivity";
    }
    if (!caps) {
        caps = exports.caps.android19();
    }

    var serverConfig = {
        host: "localhost",
        port: process.env.APPIUM_PORT || 4723
    };
    var driver = wd.promiseChainRemote(serverConfig);
    exports.configureLogging(driver);

    var desired = exports.caps.android19();
    desired.appPackage = appId;
    desired.appActivity = "com.tns.NativeScriptActivity";
    return driver.init(desired);
};

exports.configureLogging = function(driver) {
  driver.on('status', function (info) {
    console.log(info.cyan);
  });
  driver.on('command', function (meth, path, data) {
    console.log(' > ' + meth.yellow, path.grey, data || '');
  });
  driver.on('http', function (meth, path, data) {
    console.log(' > ' + meth.magenta, path, (data || '').grey);
  });
};

exports.caps = {
    android19: function(){ 
        return {
            browserName: '',
            'appium-version': '1.5',
            platformName: 'Android',
            platformVersion: '4.4.2',
            deviceName: 'Android Emulator',
            app: undefined // will be set later
        };
    },
    ios92: function() { 
        return {
            browserName: '',
            'appium-version': '1.5',
            platformName: 'iOS',
            platformVersion: '9.2',
            deviceName: 'iPhone 5s',
            app: undefined // will be set later
        };
    },
};
