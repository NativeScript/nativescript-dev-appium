# nativescript-dev-appium

A helper package to make running E2E [Appium](http://appium.io) tests in NativeScript apps easier.

## Usage

Install it with:

`$ npm install --save-dev nativescript-dev-appium`

Install Appium locally:

`$ npm install --save-dev appium@1.6.3`

Or install appium globally (to avoid installing it for every app):

`$ npm install -g appium@1.6.3`

After installation, you should have a sample test below the `e2e-tests` dir which you can rename of your choice. However, if you rename the folder you will have to specify it using `--testfolder=someFolderName` option.

Before running the tests you will have to build your app for the platform on test or both. Navigate to your demo app folder from where you will execute the commands that follow.

```
$ tns build android
```

or

```
$ tns build ios
```

The command that will run the tests should specify the targeted platform using the `runtype` option as shown below:

```
$ npm run appium --runtype=android23
```
For Android possible options are android19, android23, android25.

or

```
$ npm run appium --runtype=ios-simulator10
```
For IOS there is one more option `ios-simulator92`.

Generated tests are standard [Mocha](http://mochajs.org) tests.

## Troubleshooting

Use the `--verbose` option to get error details:

```
$ npm run appium --runtype=android --verbose
```

## Missing features

1. Faster developer turnaround when working on an app. Find a way to use livesync and kick off Appium tests for the app that's on the device already.
