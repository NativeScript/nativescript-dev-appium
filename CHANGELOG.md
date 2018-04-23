<a name="3.3.0"></a>
# [3.3.0](https://github.com/NativeScript/nativescript-dev-appium/compare/v3.2.0...v3.3.0) (2018-04-21)


### Bug Fixes

* **device-controller:** unintsall app ([#114](https://github.com/NativeScript/nativescript-dev-appium/issues/114)) ([53e615d](https://github.com/NativeScript/nativescript-dev-appium/commit/53e615d))
* **package.json:** Move TypeScript types dependencies to devDependencies ([#101](https://github.com/NativeScript/nativescript-dev-appium/issues/101)) ([5cc8dd3](https://github.com/NativeScript/nativescript-dev-appium/commit/5cc8dd3))
* **postinstall:** install [@types](https://github.com/types) to project's devDependencies ([#103](https://github.com/NativeScript/nativescript-dev-appium/issues/103)) ([637d153](https://github.com/NativeScript/nativescript-dev-appium/commit/637d153))
* resolve application path. Already compatible with nativescript@4.0.0  ([#97](https://github.com/NativeScript/nativescript-dev-appium/issues/97)) ([51446b1](https://github.com/NativeScript/nativescript-dev-appium/commit/51446b1))


### Features

* **frame-comparer:** test animations and transitions:  ([#96](https://github.com/NativeScript/nativescript-dev-appium/issues/96)) ([ac00ec048a948f787a9ae6ef077a5fea476dc479](https://github.com/NativeScript/nativescript-dev-appium/commit/ac00ec048a948f787a9ae6ef077a5fea476dc479))
* **android:** add "Don't keep activities" functionality ([#94](https://github.com/NativeScript/nativescript-dev-appium/issues/94)) ([21ecadc](https://github.com/NativeScript/nativescript-dev-appium/commit/21ecadc))
* **AppiumDriver:** add findElementByAccessibilityIdIfExists ([#110](https://github.com/NativeScript/nativescript-dev-appium/issues/110)) ([38ec681](https://github.com/NativeScript/nativescript-dev-appium/commit/38ec681))
* **AppiumDriver:** tap on point 
* resolve automatically application package(android), activity(android) and bundleId(iOS) ([#109](https://github.com/NativeScript/nativescript-dev-appium/issues/109)) ([7497cd0](https://github.com/NativeScript/nativescript-dev-appium/commit/7497cd0))
* devMode option to skip instalation of application
* findElementByAccessibilityIdIfExists
* expose get reportsPath/ storageByDeviceName/ storageByPlatform


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
- Simplify `package.json` scripts. Upgraders should delete any older `nativescript-dev-appium` scripts from the `package.json` file before installing 0.1.x.

# 0.0.19 (2016-08-02)

- Initial release. Supporting android, iOS, and iOS simulator test run types.

# 2.0.0 (2017-08-09)

- Introduce typescript support
- Async/await
- Introduce new test cycle.
- Introduce new methods for getting XPath of element
