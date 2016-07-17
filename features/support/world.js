// features/support/world.js
var nsAppium = require('nativescript-dev-cucumber');
var testRunType = process.env.TEST_RUN_TYPE;
var driver;

if (testRunType === 'android') {
  driver = nsAppium.createDriver({
    browserName: '',
    'appium-version': '1.5',
    platformName: 'Android',
    platformVersion: '4.4.2',
    deviceName: 'Android Emulator',
    app: undefined // will be set later
  });
} else if (testRunType === 'ios-simulator' || testRunType === 'ios') {
  driver = nsAppium.createDriver({
    browserName: '',
    'appium-version': '1.5',
    platformName: 'iOS',
    platformVersion: '9.2',
    deviceName: 'iPhone 6',
    app: undefined // will be set later
  });
} else {
  throw new Error('Incorrect test run type: ' + testRunType);
}

function World() {
  this.driver = driver;
}

module.exports = function() {
  this.World = World;

  this.AfterFeatures(function () {
    driver
      .quit()
      .finally(function () {
        console.log('Driver quit successfully');
      });
  });
};
