# nativescript-dev-appium

A package to help with writing and executing e2e [Appium](http://appium.io) tests.

## <a name='requirements'></a>Requirments

The `nativescript-dev-appium` plugin requires:
* latest version of [Appium](https://github.com/appium/appium/releases)
* latest version of [Xcode](https://developer.apple.com/library/content/releasenotes/DeveloperTools/RN-Xcode/Chapters/Introduction.html)
* [Android SDK Tools](https://developer.android.com/studio/releases/sdk-tools.html) version greater than 25.3.0

## <a name='setup'></a>Set Up

Add the plugin as a `devDependency` to your project:

`$ npm install -D nativescript-dev-appium`

Then install [Appium](https://www.npmjs.com/package/appium) - we recommend a global installation to avoid adding it to every project you would like to test:

`$ npm install -g appium`

After completion of the installation, if your project has a dependency to *TypeScript*, the plugin should have added an `e2e` folder containing predefined configs and samples.

### Structure

        my-app
        ├── app
        ├── e2e
            ├── configs
                ├── appium.capabilities.json
                ├── mocha.opts
            ├── sample.e2e-test.ts
            ├── setup.ts
            ├── tsconfig.json
        ├── ...
        ├── package.json
        ├── tsconfig.json

> Note - To avoid any incompatibilities between the source of `e2e` tests and the source of the application, we recommend to exclude the `e2e` folder from the application's `tsconfig.json` file: `exclude": [ "e2e" ]`

### Files Preview

|File                |Purpose|
|:-------------------------------:|:-------------------:|
|`config/appium.capabilities.json`|Contains predefined configurations for test execution.|
|`config/mocha.opts`              |A default mocha configuration file.                   |
|`sample.e2e-test.ts`             |Contains a predefined ready-to-execute sample tests of the default [*hello-world*](https://github.com/NativeScript/template-hello-world-ts) template.|
|`setup.ts`                       |Defines the `before` and `after` test execution hooks responsible to start and stop the [Appium](http://appium.io/) server.|
|`tsconfig.json`                  |TypeScript compiler configuration file for the `e2e` tests.|

> Note - The folders below are related to the image comparison feature:
> * `e2e/reports` - this folder is created during test execution and stores the actual images from comparison
> * `e2e/resources` - this folder aims to store the expected images for comparison

## <a name='usage'></a>Usage

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
$ npm run e2e -- --runType android25
```

or

```
$ npm run e2e -- --runType sim.iPhone8.iOS110
```

Generated tests are standard [Mocha](http://mochajs.org) tests.

## <a name='customCapabilities'></a>Custom Appium Capabilities

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

Notice that once custom capabilities are provided you will be able to pick any of them using the `--runType` option (e.g. `--runType android25`). Sample content of `appium.capabilities.json` file could be:

```
{
    "android21": {
            "browserName": "",
            "platformName": "Android",
            "platformVersion": "5.0",
            "deviceName": "Android Emulator",
            "noReset": false,
            "app": ""
        
    },
    "android25": {
            "browserName": "",
            "platformName": "Android",
            "platformVersion": "7.0",
            "deviceName": "Android Emulator",
            "noReset": false,
            "app": ""
        
    },
    "sim.iPhone8.iOS110": {
            "browserName": "",
            "platformName": "iOS",
            "platformVersion": "11.0",
            "deviceName": "iPhone 8 110",
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
|port| Appium server port|
|storage| Specify remote image storage |
|ignoreDeviceController| Setting this option you will use default appium device controller which is recommended when tests are executed on cloud based solutions |

Examples:

```
$ npm run e2e -- --runType android25 --sauceLab --appLocation demo.apk --capsLocation "/e2e-tests/config"
```

## Features

1. Compare images. Block out areas to ignore in comparison.
2. Find elements findElementByText, findElementsByXPath, findElementByAccessibilityId etc...
3. Gesture support: swipe, scroll, drag, scrollTo
4. Action support: tap, click, doubleTap, hold, 
5. Element characteristics: location, exists, size, isDisplayed
6. Find strategies: waitForExist, waitForExistNot
7. Direct access to webdriver and webdriverio

## Troubleshooting

Use the `--verbose` option to get error details:

```
$ npm run e2e -- --runType android25 --verbose
```

## Common Problems

1. Missing installed appium
2. Missleading appPath or capabilities location. Please make sure that the path to the app or capabilities location is correct.


## Missing Features

1. Faster developer turnaround when working on an app. Find a way to use livesync and kick off Appium tests for the app that's on the device already.
