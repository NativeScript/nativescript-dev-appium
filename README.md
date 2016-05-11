# nativescript-dev-appium

A helper package to make running E2E [Appium](http://appium.io) tests in NativeScript apps easier.

## Usage

Install it with:

`$ tns install appium`

It will produce a sample test below the `e2e-tests` dir. Now, run it with:

```
$ tns run android --justlaunch && npm run appium-android.
```

The tests are standard [Mocha](http://mochajs.org) tests.
