require('./appium-setup');
var path = require('path');
var glob = require('glob');

var testRunType = process.env.TEST_RUN_TYPE;
var projectDir = path.dirname(path.dirname(__dirname));
var appId = require(path.join(projectDir, 'package.json')).nativescript.id;

var wd = require('wd');

exports.createDriver = function(caps, activityName) {
    if (!activityName) {
        activityName = 'com.tns.NativeScriptActivity';
    }
    if (!caps) {
        caps = exports.getDefaultCapabilities();
    }

    var serverConfig = {
        host: 'localhost',
        port: process.env.APPIUM_PORT || 4723
    };
    var driver = wd.promiseChainRemote(serverConfig);
    exports.configureLogging(driver);

    if (!caps.app) {
        caps.app = exports.getAppPath();
    }
    return driver.init(caps);
};

exports.getAppPath = function() {
    if (testRunType === 'android') {
        var apks = glob.sync('platforms/android/**/*.apk').filter(function(file) { return file.indexOf('unaligned') < 0; });
        return apks[0];
    } else if (testRunType === 'ios-simulator') {
        var simulatorApps = glob.sync('platforms/ios/build/emulator/**/*.app');
        return simulatorApps[0];
    } else if (testRunType === 'ios') {
        var deviceApps = glob.sync('platforms/ios/build/device/**/*.app');
        return deviceApps[0];
    } else {
        throw new Error('Incorrect test run type: ' + testRunType);
    }
};

exports.getDefaultCapabilities = function() {
    if (testRunType === 'android') {
        return exports.caps.android19();
    } else if (testRunType === 'ios-simulator') {
        return exports.caps.ios92();
    } else if (testRunType === 'ios') {
        return exports.caps.ios92();
    } else {
        throw new Error('Incorrect test run type: ' + testRunType);
    }
}

function log(message) {
    if (process.env.VERBOSE_LOG) {
        console.log(message);
    }
}

exports.configureLogging = function(driver) {
  driver.on('status', function (info) {
    log(info.cyan);
  });
  driver.on('command', function (meth, path, data) {
    log(' > ' + meth.yellow + path.grey + ' ' + (data || ''));
  });
  driver.on('http', function (meth, path, data) {
    log(' > ' + meth.magenta + path + ' ' + (data || '').grey);
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
            deviceName: 'iPhone 6',
            app: undefined // will be set later
        };
    },
};
