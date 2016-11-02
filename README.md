# nativescript-dev-appium

A helper package to make running E2E [Appium](http://appium.io) tests in NativeScript apps easier.

## Usage

Install it with:

`$ tns install appium`

It will produce a sample test below the `e2e-tests` dir. Now, run it with:

```
$ npm run appium-android
```

The tests are standard [Mocha](http://mochajs.org) tests.

## Missing features

1. iOS physical device support (currently only works in simulator)
2. Better text output: colors, etc.
3. Better integration with nativescript-cli.
  - Run tests with a `tns appium ...` command
  - Better deployment to device (`tns deploy` instead of `tns run`)
  - Detect changes to app files and avoid rebuilding/redeploying the app if only test code has changed.
4. Developer workflow - fast test runs when working on an app. Maybe using livesync.
