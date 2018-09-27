const nsAppium = require("nativescript-dev-appium");

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new SpecReporter({
  spec: {
    displayPending: true
  }
}));

beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1200000;
    await nsAppium.startServer();
});

afterAll(async () => {
    await nsAppium.stopServer();
});
