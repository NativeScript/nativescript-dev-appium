// features/support/world.js
var nsAppium = require('nativescript-dev-cucumber');
var driver = nsAppium.createDriver();

function World() {
  this.driver = driver;
}

module.exports = function() {
  this.World = World;

  this.AfterFeatures(function () {
    driver
      .quit()
      .finally(function () {
        console.log("Driver quit successfully");
      });
  });
};