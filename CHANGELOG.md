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