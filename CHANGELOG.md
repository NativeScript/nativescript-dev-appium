<a name="5.1.0"></a>
# [5.1.0](https://github.com/NativeScript/nativescript-dev-appium/compare/5.0.0...5.1.0) (2019-03-07)


### Bug Fixes

* args ([#163](https://github.com/NativeScript/nativescript-dev-appium/issues/163)) ([db33521](https://github.com/NativeScript/nativescript-dev-appium/commit/db33521))
* find element by automation name ([#206](https://github.com/NativeScript/nativescript-dev-appium/issues/206)) ([df9e6ed](https://github.com/NativeScript/nativescript-dev-appium/commit/df9e6ed))
* skip prompting on post install when the console is not interactive ([1042328](https://github.com/NativeScript/nativescript-dev-appium/commit/1042328))
* **uielement:** isSelected and isChecked ([#203](https://github.com/NativeScript/nativescript-dev-appium/issues/203)) ([4e3e290](https://github.com/NativeScript/nativescript-dev-appium/commit/4e3e290))
* check if storage is 'undefined' ([#99](https://github.com/NativeScript/nativescript-dev-appium/issues/99)) ([e2ca7cf](https://github.com/NativeScript/nativescript-dev-appium/commit/e2ca7cf))



### Features

* extend interaction with text ([#208](https://github.com/NativeScript/nativescript-dev-appium/issues/208)) ([45a8ff6](https://github.com/NativeScript/nativescript-dev-appium/commit/45a8ff6))
* remoteAddress option ([#202](https://github.com/NativeScript/nativescript-dev-appium/issues/202)) ([efee24e](https://github.com/NativeScript/nativescript-dev-appium/commit/efee24e))
* start session command. ([#207](https://github.com/NativeScript/nativescript-dev-appium/issues/207)) ([89ab7b0](https://github.com/NativeScript/nativescript-dev-appium/commit/89ab7b0))


<a name="5.0.0"></a>
# [5.0.0]() (2019-01-29)

### Bug Fixes
* isDisplayed already checks whether actual coordinates of an element are in visible viewport of display
* resolve app name when starting of appium server is skipped
* **locators** android webView locator is renamed to android.webkit.WebView

### Features
* run tests without providing appium capabilities config/ --runType. 
  This option is only available for local runs which means that 
  device should already be started and the app should already be installed.
* device properties can be passed as regex expression (this is not available in sauceLab)
* isSelected method - works only if the element has tag select
* --runType parameter is already case insensitive e.g. sim.iOS == sim.ios
* waitForElement method = searched for element by automation text and wait time in milliseconds.
* include support for jasmine.
* include support for javascript, typescript, angular, vue and angular(shared project)

### BREAKING CHANGES

* **devMode:** validate() args returns a promise
* There will be no longer --reuseDevice option available. From now on will be preserved options from appium caps "fullReset"

Migration steps:
To reuse device set in your Appium capabilities file <b>"fullReset": false</b>
Not to reuse device set <b>"fullReset": true</b>

Before:
```
$ npm run e2e -- --runType android23 --reuseDevice
```
After there are a few options in order to preserve device alive:

1. If you are developing your application with `tns run android/ ios`

```
$ npm run e2e android or ios
```
2. If you are running on CI, change appium options as
    --fullReset: false -> this will keep device alive
    --noReset: false -> this will install app on device



<a name="4.0.6"></a>
# [4.0.6]() (2018-08-08)
### Bug Fixes
* fix: resolve app name when skip starting server

<a name="4.0.5"></a>
# [4.0.5]() (2018-08-08)
### Bug Fixes
* fix: export SearchOptions enum

<a name="4.0.4"></a>
# [4.0.4]() (2018-08-07)
### Bug Fixes
* fix: skip starting of local appium server when sauceLab option is set to true even if createServer is called

<a name="4.0.3"></a>
# [4.0.3]() (2018-08-04)
### Bug Fixes
* fix: get capabilities when a path to a folder is provided

<a name="4.0.2"></a>
# [4.0.2]() (2018-07-23)
### Bug Fixes
* fix: get device name when attachToDebug option is used

<a name="4.0.1"></a>
# [4.0.1]() (2018-07-20)

### Features
* **UIElement:** introduce wd property
* **AppiumDriver:** introduce touchAction() 
* **ElementHelper:** introduce getXPathByTextAtributes() - returns element/s specific type or '//*' that meets all attributes for ios ["label", "value", "hint"] and for android ["content-desc", "resource-id", "text"]
* --attachToDebug option requires only --port option
* --sessionId options requires only --port option


<a name="4.0.0"></a>
# [4.0.0]() (2018-07-02)

### Bug Fixes

* fix sauce lab compatibility (#118) ([48946fd](https://github.com/NativeScript/nativescript-dev-appium/commit/48946fd)), closes [#118](https://github.com/NativeScript/nativescript-dev-appium/issues/118)
* fix exiting appium server process
* **android:** setDontKeepActivities should work for all api levels

### Features

* optins "--cleanApp" to uninstall application after finishing tests (#128) ([6447403](https://github.com/NativeScript/nativescript-dev-appium/commit/6447403)), closes [#128](https://github.com/NativeScript/nativescript-dev-appium/issues/128)
* attach to session option "--attachToDebug"
* create session "--createSession"
* option "--sessionId" to provide specific session
* deviceLog ([1279323](https://github.com/NativeScript/nativescript-dev-appium/commit/1279323)). exposed driver.getDeviceLog() which will return device log and exposed driver.logDeviceLog(fileName, logtype) which will create such file with postfix `${fileName}_${logtype}.log` in reports folder under appName/deviceName
* **android:** provide option "--relaxedSecurity" to enable relaxed security and execute shell commands using appium android driver (#126) ([ce780bf](https://github.com/NativeScript/nativescript-dev-appium/commit/ce780bf)), closes [#126](https://github.com/NativeScript/nativescript-dev-appium/issues/126)

### BREAKING CHANGES

* **android:** change default automation name if not specified in appium config  (#122) ([3ba0a1c](https://github.com/NativeScript/nativescript-dev-appium/commit/3ba0a1c)), closes [#122](https://github.com/NativeScript/nativescript-dev-appium/issues/122).

Before:
```
Default automation was 'Appium' for all api levels. 
```
After:
```
For all api levels higher or equal than api23 (including) default automator name is 'UiAutomator2'
For all api levels lower than api23 default automator is still 'Appium'
```
* rename DeviceController to DeviceManager - In general this should not affect any user except those that are using DeviceManager explicitly
* bump version of mocha to ~5.1.0 which requires flag --exit to be set in mocha config file when the tests are run ot Travis 
```

<a name="3.3.0"></a>
# [3.3.0](https://github.com/NativeScript/nativescript-dev-appium/compare/v3.2.0...v3.3.0) (2018-04-21)


### Bug Fixes

* **device-controller:** uninstall app ([#114](https://github.com/NativeScript/nativescript-dev-appium/issues/114)) ([53e615d](https://github.com/NativeScript/nativescript-dev-appium/commit/53e615d))
* **package.json:** Move TypeScript types dependencies to devDependencies ([#101](https://github.com/NativeScript/nativescript-dev-appium/issues/101)) ([5cc8dd3](https://github.com/NativeScript/nativescript-dev-appium/commit/5cc8dd3))
* **postinstall:** install [@types](https://github.com/types) to project's devDependencies ([#103](https://github.com/NativeScript/nativescript-dev-appium/issues/103)) ([637d153](https://github.com/NativeScript/nativescript-dev-appium/commit/637d153))
* resolve application path. Already compatible with nativescript@4.0.0  ([#97](https://github.com/NativeScript/nativescript-dev-appium/issues/97)) ([51446b1](https://github.com/NativeScript/nativescript-dev-appium/commit/51446b1))


### Features

* **frame-comparer:** test animations and transitions:  ([#96](https://github.com/NativeScript/nativescript-dev-appium/issues/96)) ([ac00ec048a948f787a9ae6ef077a5fea476dc479](https://github.com/NativeScript/nativescript-dev-appium/commit/ac00ec048a948f787a9ae6ef077a5fea476dc479))
* **android:** add "Don't keep activities" functionality ([#94](https://github.com/NativeScript/nativescript-dev-appium/issues/94)) ([21ecadc](https://github.com/NativeScript/nativescript-dev-appium/commit/21ecadc))
* **AppiumDriver:** add findElementByAccessibilityIdIfExists ([#110](https://github.com/NativeScript/nativescript-dev-appium/issues/110)) ([38ec681](https://github.com/NativeScript/nativescript-dev-appium/commit/38ec681))
* **AppiumDriver:** tap on point 
* resolve automatically application package(android), activity(android) and bundleId(iOS) ([#109](https://github.com/NativeScript/nativescript-dev-appium/issues/109)) ([7497cd0](https://github.com/NativeScript/nativescript-dev-appium/commit/7497cd0))
* devMode option to skip installation of application
* findElementByAccessibilityIdIfExists
* expose get reportsPath/ storageByDeviceName/ storageByPlatform
* **android:** resolve automatically application start activity.


### BREAKING CHANGES

* Resolve application name using appPackage(android) or bundleId(iOS). This change results in the resources/reports folder. 

Before:
```
application name -> app-release.apk/ app-debug.apk/ app.app/ app.ipa 
Folder structure -> resources(reports)/app/<device name> 
```

After:
```
application name -> app-release.apk/ app-debug.apk/ app.app/ app.ipa and an appPackage name or a bundleId -> org.nativesscript.testapplication 
Folder structure -> resources(reports)/testapplication/<device name> 
```



<a name="3.1.0"></a>
# [3.1.0](https://github.com/NativeScript/nativescript-dev-appium/compare/3.0.0...3.1.0) (2017-11-22)


### Bug Fixes

* **nativescript-dev-appium:** Node.js 8 compatibility ([#56](https://github.com/NativeScript/nativescript-dev-appium/issues/56)) ([c33356a](https://github.com/NativeScript/nativescript-dev-appium/commit/c33356a))
* **nativescript-dev-appium** skip adding of plugin's devDependencies to project due to [npm/npm#17379](https://github.com/npm/npm/issues/17379) ([#65](https://github.com/NativeScript/nativescript-dev-appium/issues/65)) ([1335dd4](https://github.com/NativeScript/nativescript-dev-appium/commit/1335dd4))


### Features

* **image-comparison:** exclude status bar from comparison ([#42](https://github.com/NativeScript/nativescript-dev-appium/issues/42)) ([c3f1366](https://github.com/NativeScript/nativescript-dev-appium/commit/c3f1366))
* **image-comparison:** exclude areas from comparison ([#61](https://github.com/NativeScript/nativescript-dev-appium/issues/61)) ([9e3e30c](https://github.com/NativeScript/nativescript-dev-appium/commit/9e3e30c))
* **image-comparison:** expose IRectangle ([#63](https://github.com/NativeScript/nativescript-dev-appium/issues/63)) ([f7c5b80](https://github.com/NativeScript/nativescript-dev-appium/commit/f7c5b80))
* **driver:** expose isAndroid and isIOS ([#62](https://github.com/NativeScript/nativescript-dev-appium/issues/62)) ([3e7263d](https://github.com/NativeScript/nativescript-dev-appium/commit/3e7263d))
* **driver:** expose logPageSource and logScreenshot methods
* **nativescript-dev-appium:** introduce reuseDevice, storage, testReports options
* **nativescript-dev-appium:** ES6 Support


### BREAKING CHANGES

* ES6 Support - To avoid any incompatibilities between the source of `e2e` tests (ES6) and the source of the application (ES5), we recommend to exclude the `e2e` folder from the application's `tsconfig.json` file: `exclude": [ "e2e" ]`.

#### Migration Steps

Update the `e2e/tsconfig.json` file:

Before:
```
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es5",
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "importHelpers": true,
        "types": [
            "node",
            "mocha",
            "chai"
        ],
        "lib": [
            "es6",
            "dom"
        ]
    }
}
```

After:
```
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es6",
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "importHelpers": false,
        "types": [
            "node",
            "mocha",
            "chai"
        ],
        "lib": [
            "es2015",
            "dom"
        ]
    }
}
```



# 0.1.0 (2016-12-20)
- Introduce `--verbose` option for troubleshooting.
- Simplify `package.json` scripts. Upgrades should delete any older `nativescript-dev-appium` scripts from the `package.json` file before installing 0.1.x.

# 0.0.19 (2016-08-02)

- Initial release. Supporting android, iOS, and iOS simulator test run types.

# 2.0.0 (2017-08-09)

- Introduce typescript support
- Async/await
- Introduce new test cycle.
- Introduce new methods for getting XPath of element
