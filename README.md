# nativescript-dev-appium

A helper package to make running E2E [Appium](http://appium.io) tests in NativeScript apps easier.

## Usage

Install it with:

`$ tns install appium`

It will produce a sample test below the `e2e-tests` dir. Now, run it with:

```
$ npm run appium-android
```

or

```
$ npm run appium-ios-simulator
```

or

```
$ npm run appium-ios
```

All of the above commands will run a `tns build` command before running tests. If you have built your project already and wish to just run your tests, execute:

```
$ npm run appium --runType=android
```

The tests are standard [Mocha](http://mochajs.org) tests.

## Troubleshooting

Use the `--verbose` option to get error details:

```
$ npm run appium-android --verbose
```

or


```
$ npm run appium --runType=android --verbose
```

## Missing features

1. Better text output: colors, etc.
2. Better integration with nativescript-cli.
  - Better deployment to device (`tns deploy` instead of `tns run`)
  - Detect changes to app files and avoid rebuilding/redeploying the app if only test code has changed.
3. Developer workflow - fast test runs when working on an app. Maybe using livesync.
