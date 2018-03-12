# nativescript-dev-appium

A package to help with writing and executing e2e [Appium](http://appium.io) tests.

<!-- TOC depthFrom:2 -->

- [Features](#features)
- [Requirеments](#requirеments)
- [Setup](#setup)
    - [Structure](#structure)
    - [Files Preview](#files-preview)
- [Usage](#usage)
- [Blogs](#blogs)
- [Demos](#demos)
- [Videos](#videos)
- [Custom Appium Capabilities](#custom-appium-capabilities)
- [Options](#options)
- [Troubleshooting](#troubleshooting)
- [Common Problems](#common-problems)
- [Missing Features](#missing-features)
- [Contribute](#contribute)
- [Get Help](#get-help)

<!-- /TOC -->

## Features

1. Cross-platform [locators](https://github.com/NativeScript/nativescript-dev-appium/blob/master/lib/locators.ts)
1. Find strategies: *findElementByText*, *findElementByClassName*, *findElementByAccessibilityId*, *findElementByXPath*
1. Actions: *tap*, *click*, *doubleTap*, *hold*
1. Gestures: *scroll*, *scrollTo*, *swipe*, *drag*
1. Cross-platform element abstraction with *exists*, *waitForExist*, *waitForNotExist*, *location*, *isDisplayed*, *size*, *text* properties
1. Ability to turn on/off “Don’t keep activities” setting in the Developer options for Android
1. Direct access to driver
1. Typings
1. Async/Await
1. Open source cloud builds integration, i. e. [Sauce Labs](https://saucelabs.com/)
1. Image comparison of: screen, rectangle; block out areas to ignore
1. [WIP] Ability to verify animations/transitions through video/images; please refer to [frame-comparer](https://github.com/SvetoslavTsenov/frame-comparer)

## Requirеments

The `nativescript-dev-appium` plugin requires:
* latest version of [Appium](https://github.com/appium/appium/releases)
    * for correct functioning of the [XCUITest](https://github.com/appium/appium/blob/master/docs/en/drivers/ios-xcuitest.md) driver for iOS, additional libraries are required (see the [Setup](#setup) section)
    * for correct functioning of the [mobile-devices-controller](https://github.com/NativeScript/mobile-devices-controller) for Android emulators, `telnet` is required (see the [Setup](#setup) section)
* latest version of [Xcode](https://developer.apple.com/library/content/releasenotes/DeveloperTools/RN-Xcode/Chapters/Introduction.html)
* [Android SDK Tools](https://developer.android.com/studio/releases/sdk-tools.html) version greater than 25.3.0

## Setup

Add the plugin as a *devDependency* to your project:

```shell
$ npm install -D nativescript-dev-appium
```

> After completion of the installation, if your project has a dependency to *TypeScript*, the plugin should have added an `e2e` folder containing predefined configs and samples.

Then install [Appium](https://www.npmjs.com/package/appium) - we recommend a global installation to avoid adding it to every project you would like to test:

```shell
$ npm install -g appium
```

Install external dependencies of [XCUITest](https://github.com/appium/appium-xcuitest-driver/blob/master/README.md#external-dependencies) driver for iOS via:

* [Homebrew](https://brew.sh):

```shell
$ brew install carthage
$ brew install libimobiledevice --HEAD
$ brew install ideviceinstaller
$ brew install ios-webkit-debug-proxy
```

* [NPM](https://www.npmjs.com/):

```shell
$ npm install -g ios-deploy
```

> For detailed information on external dependencies, please, refer to the [XCUITest](https://github.com/appium/appium-xcuitest-driver/blob/master/README.md#external-dependencies) repository.

For correct functioning of the [mobile-devices-controller](https://github.com/NativeScript/mobile-devices-controller) for Android emulators, `telnet` is required to be available on your system.

As the `telnet` was removed from *macOS High Sierra*, it could be installed as follows:

```shell
$ brew install telnet
```

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

> To avoid any incompatibilities between the source of *e2e* tests (ES6) and the source of the application (ES5), we recommend to exclude the *e2e* folder from the application's *tsconfig.json* file: `exclude": [ "e2e" ]`.

### Files Preview

|File                |Purpose|
|:-----------------------------:|:-------------------:|
|config/appium.capabilities.json|Contains predefined configurations for test execution.|
|config/mocha.opts              |A default mocha configuration file.                   |
|sample.e2e-test.ts             |Contains a predefined ready-to-execute sample tests of the default [hello-world-ts](https://github.com/NativeScript/template-hello-world-ts) template.|
|setup.ts                       |Defines the `before` and `after` test execution hooks responsible to start and stop the [Appium](http://appium.io/) server.|
|tsconfig.json                  |TypeScript compiler configuration file for the `e2e` tests.|

> Note - the folders below are related to the image comparison feature:
> * `e2e/reports` - this folder is created during test execution and stores the actual images from comparison
> * `e2e/resources` - this folder aims to store the expected images for comparison

## Usage

Before running the tests you will have to build your app for the platform on test or both. Navigate to your demo app folder from where you will execute the commands that follow.

```shell
$ tns build android
```

or

```shell
$ tns build ios
```

The command that will run the tests should specify the targeted capabilities configuration using the `runType` option as shown below. This way a capabilities will be selected from the [capabilities](#custom-appium-capabilities) configuration file.

```
$ npm run e2e -- --runType android25
```

or

```
$ npm run e2e -- --runType sim.iPhone8.iOS110
```

Generated tests are standard [Mocha](http://mochajs.org) tests.

## Blogs

2018, March 6th: [Start Testing Your NativeScript Apps Properly](https://www.nativescript.org/blog/start-testing-your-nativescript-apps-properly)

## Demos

The official demos of the [nativescript-dev-appium](https://github.com/NativeScript/nativescript-dev-appium#nativescript-dev-appium) plugin: [https://github.com/NativeScript/ns-dev-days-appium-plugin](https://github.com/NativeScript/ns-dev-days-appium-plugin).

These tests demonstrate:
- [template-hello-world-ts/e2e](https://github.com/NativeScript/ns-dev-days-appium-plugin/blob/master/template-hello-world-ts/e2e/) - *nativescript-dev-appium* basics: configurations, find strategies, locators, actions.
- [template-hello-world-ng/e2e](https://github.com/NativeScript/ns-dev-days-appium-plugin/blob/master/template-hello-world-ng/e2e/) - the page object pattern with *nativescript-dev-appium*.

**Tests on NativeScript Continuous Integration**

[NativeScript/e2e/modal-navigation](https://github.com/NativeScript/NativeScript/tree/master/e2e/modal-navigation) - use "Don't keep activities", run background (minimize/restore) app.

[nativescript-angular/e2e/renderer](https://github.com/NativeScript/nativescript-angular/tree/master/e2e/renderer) - use basics: locators, find strategies, assertions.

[nativescript-angular/e2e/router](https://github.com/NativeScript/nativescript-angular/tree/master/e2e/router) - use basics: locators, find strategies, assertions.

[nativescript-dev-webpack/demo/AngularApp](https://github.com/NativeScript/nativescript-dev-webpack/tree/master/demo/AngularApp) - use data driven approach, compares element's images.

[nativescript-dev-webpack/demo/JavaScriptApp](https://github.com/NativeScript/nativescript-dev-webpack/tree/master/demo/JavaScriptApp) - use data driven approach, compares element's images.

[nativescript-dev-webpack/demo/TypeScriptApp](https://github.com/NativeScript/nativescript-dev-webpack/tree/master/demo/TypeScriptApp) - use data driven approach, compares element's images.

## Videos

2018 March 6th: [NativeScript Air 6 - UI Testing {N} apps with DevAppium](https://www.youtube.com/watch?v=Sn4hBaxOt88)

2017 Sept 27th: [NativeScript testing with Appium](https://www.youtube.com/watch?v=Ns7boY6XNC0) @ [NativeScript Developer Day Europe 2017](https://www.nativescript.org/events/developer-day-europe-2017)

2017 Sept 19th: [Introduction to Mobile UI Test Automation](https://www.youtube.com/watch?v=LjgIM4pvhsQ
) @ [NativeScript Developer Day 2017](http://developerday.nativescript.org/)

## Custom Appium Capabilities

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

Notice that once custom capabilities are provided you will be able to pick any of them using the `--runType` option (e.g. `--runType android25`). See sample content of `appium.capabilities.json` file below. For more details regarding the Appium Capabilities read [Appium documentation about Desired Capabilities](https://appium.io/docs/en/writing-running-appium/caps/):

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

## Options

|Option| Description | Value |
|---|---|---|
|runType| Select the capabilities from your config file `appium.capabilities.json`| Consider using `android`, `device`, `sim` strings as part of your `runType` option if you haven't provided `app` capability. Thus, the runner will look for app package in the right location for the current run. <br/> e.g. --runType ios-device10iPhone6|
|appPath| Provide location of the app package to be tested. This will overwrite all provided capabilities for app| Possible values are:<br/> - app build package name (in case `--sauceLab` option is set it will prepend `sauce-storage:` in front of the app name so app has to be [uploaded to Sauce Labs](https://wiki.saucelabs.com/display/DOCS/Uploading+Mobile+Applications+to+Sauce+Storage+for+Testing) before execution starts)<br/> - path e.g. `platforms/android/build/outputs/apk/demo.apk`.<br/> Example: --appPath demo-debug.apk|
| reuseDevice | Reuse the device specified in the `runType` capabilities. If the emulator/simulator is not running, it will launch, execute tests and remain running. The next execution of `npm run e2e` with the `reuseDevice` option will attach to the already running emulator/simulator, execute tests and keep it running. | e.g. --reuseDevice |
|sauceLab| Enable tests execution in [Sauce Labs](https://saucelabs.com/). As a prerequisite you will have to define `SAUCE_USER` and `SAUCE_KEY` as [environment variable](https://wiki.saucelabs.com/display/DOCS/Best+Practice%3A+Use+Environment+Variables+for+Authentication+Credentials)| e.g. --sauceLab|
|capsLocation| Change the location where `appium.capabilities.json` config file can be. It should be relative to the root directory | e.g. --capsLocation /e2e-tests|
|port| Appium server port|
|storage| Specify remote image storage |
|ignoreDeviceController| Setting this option you will use default appium device controller which is recommended when tests are executed on cloud based solutions |

Examples:

```
$ npm run e2e -- --runType android25 --sauceLab --appLocation demo.apk --capsLocation "/e2e-tests/config"
```

## Troubleshooting

Use the `--verbose` option to get error details:

```
$ npm run e2e -- --runType android25 --verbose
```

## Common Problems

1. Missing installed appium
2. Misleading appPath or capabilities location. Please make sure that the path to the app or capabilities location is correct.


## Missing Features

1. Faster developer turnaround when working on an app. Find a way to use livesync and kick off Appium tests for the app that's on the device already.

## Contribute
We love PRs! Check out the [contributing guidelines](CONTRIBUTING.md). If you want to contribute, but you are not sure where to start - look for [issues labeled `help wanted`](https://github.com/NativeScript/nativescript-dev-appium/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22).

## Get Help 
Please, use [github issues](https://github.com/NativeScript/nativescript-dev-appium/issues) strictly for [reporting bugs](CONTRIBUTING.md#reporting-bugs) or [requesting features](CONTRIBUTING.md#requesting-features). For general questions and support, check out the [NativeScript community forum](https://discourse.nativescript.org/) or ask our experts in [NativeScript community Slack channel](http://developer.telerik.com/wp-login.php?action=slack-invitation).
  
![](https://ga-beacon.appspot.com/UA-111455-24/nativescript/nativescript-dev-appium?pixel) 
