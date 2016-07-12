// features/support/world.js
var nsAppium = require('nativescript-dev-appium');
var driver = nsAppium.createDriver();

function World() {
  this.driver = driver;
}

module.exports = function() {
  this.World = World;

  this.AfterFeatures(() => {
    driver
      .quit()
      .finally(function () {
        console.log("Driver quit successfully");
      });
  });
};