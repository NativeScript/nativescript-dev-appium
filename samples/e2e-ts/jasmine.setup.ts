import { startServer, stopServer } from "nativescript-dev-appium";

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new SpecReporter({
  spec: {
    displayPending: true
  }
}));

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1200000;

beforeAll(async () => {
    await startServer();
});

afterAll(async () => {
    await stopServer();
});
