# nativescript-dev-appium

A package to help with writing and executing e2e [Appium](http://appium.io) tests.

## <a name='usage'></a>Usage

Install it with:

`$ npm install --save-dev nativescript-dev-appium`

Install Appium locally:

`$ npm install --save-dev appium`

Or install appium globally (to avoid installing it for every app):

`$ npm install -g appium`

After installation, you should have a sample test below the `e2e` directory which you can rename of your choice. However, if you rename the folder you will have to specify it using `--testfolder someFolderName` option.

Before running the tests you will have to build your app for the platform on test or both. Navigate to your demo app folder from where you will execute the commands that follow.

```
$ tns build android
```

or

```
$ tns build ios
```

The command that will run the tests should specify the targeted platform using the `runType` option as shown below. This way a capabilities will be selected from the [capabilities config file](#customCapabilities).

```
$ npm run e2e -- --runType android23
```

or

```
$ npm run e2e -- --runType ios-simulator10iPhone6
```

Generated tests are standard [Mocha](http://mochajs.org) tests.

## <a name='customCapabilities'></a>Custom Appium capabilities

When installed, the plugin creates `e2e` folder containing sample test file and configuration folder `config` where your custom capabilities reside. 
The existence of such capabilities is a runner's requirement which comes from [Appium](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/caps.md). Additional locations where the runner will search for the config file are:

```
my-app
├── app
├── assets
├── package.json
.
.
.
└── appium.capabilities.json
```

If the file structure assembles plugin repo structure like for example [nativescript-plugin-seed](https://github.com/NativeScript/nativescript-plugin-seed) the suggested location is:

```
my-plugin
├── demo
├── demo-angular
├── src
└── appium.capabilities.json
```
Thus, the same configuration can be used by both apps without duplication of files.

If you wish to use another location of the capapabilities file instead default ones, you can specify it with `--capsLocation` option. Remember that the path provided has to be relative to the root directory.

Notice that once custom capabilities are provided you will be able to pick any of them using the `--runType` option (e.g. `--runType android21`). Sample content of `appium.capabilities.json` file could be:

```
{
    "android21": {
            "browserName": "",
            "appium-version": "1.6.3",
            "platformName": "Android",
            "platformVersion": "5.0",
            "deviceName": "Android Emulator",
            "noReset": false,
            "app": ""
        
    },
    "android23": {
            "browserName": "",
            "appium-version": "1.6.5",
            "platformName": "Android",
            "platformVersion": "6.0",
            "deviceName": "Android Emulator",
            "noReset": false,
            "app": ""
        
    },
    "ios-simulator10iPhone6": {
            "browserName": "",
            "appium-version": "1.6.5",
            "platformName": "iOS",
            "platformVersion": "10.0",
            "deviceName": "iPhone 6 Simulator",
            "app": ""
        
    }
}
```

As you can see, the `app` property can be left an empty string which will force the plugin to search for an app package in `platforms` folder. However, this search functionality depends on `runType` option so if you think of using it add `android`, `device`, `sim` strings as part of your `runType` option which in fact is your capability key in the config file. E.g --runType android23, --runType sim.10iPhone6. Thus, the runner will manage to look in the right location in order to search for app package.

**It is important to build your app in advance as explained in [Usage](#usage) section, because the runner expects to provide app package to it or such to exists in the search location.**

## <a name='options'></a>Options

|Option| Description | Value |
|---|---|---|
|runType| Select the capabilities from your config file `appium.capabilities.json`| Consider using `android`, `device`, `sim` strings as part of your `runType` option if you haven't provided `app` capability. Thus, the runner will look for app package in the right location for the current run. <br/> e.g. --runType ios-device10iPhone6|
|appPath| Provide location of the app package to be tested. This will overwrite all provided capabilities for app| Possible values are:<br/> - app build package name (in case `--sauceLab` option is set it will prepend `sauce-storage:` in front of the app name so app has to be [uploaded to Sauce Labs](https://wiki.saucelabs.com/display/DOCS/Uploading+Mobile+Applications+to+Sauce+Storage+for+Testing) before execution starts)<br/> - path e.g. `platforms/android/build/outputs/apk/demo.apk`.<br/> Example: --appPath demo-debug.apk|
|sauceLab| Enable tests execution in [Sauce Labs](https://saucelabs.com/). As a prerequisite you will have to define `SAUCE_USER` and `SAUCE_KEY` as [environment variable](https://wiki.saucelabs.com/display/DOCS/Best+Practice%3A+Use+Environment+Variables+for+Authentication+Credentials)| e.g. --sauceLab|
|capsLocation| Change the location where `appium.capabilities.json` config file can be. It should be relative to the root directory | e.g. --capsLocation /e2e-tests|

Examples:

```
$ npm run e2e --runType android23 --sauceLab --appLocation demo.apk --capsLocation "/e2e-tests/config"

```

## Troubleshooting

Use the `--verbose` option to get error details:

```
$ npm run appium --runType=android --verbose
```

## Missing features

1. Faster developer turnaround when working on an app. Find a way to use livesync and kick off Appium tests for the app that's on the device already.


## Br
