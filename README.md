# nativescript-dev-appium

A helper package to make running E2E [Appium](http://appium.io) tests in NativeScript apps easier.

## Usage

Install it with:

`$ npm install --save-dev nativescript-dev-appium`

Install Appium locally:

`$ npm install --save-dev appium@1.6.3`

Or install appium globally (to avoid installing it for every app):

`$ npm install -g appium@1.6.3`

After installation, you should have a sample test below the `e2e-tests` dir. Now, run it with:

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

Generated tests are standard [Mocha](http://mochajs.org) tests.

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

1. Faster developer turnaround when working on an app. Find a way to use livesync and kick off Appium tests for the app that's on the device already.
