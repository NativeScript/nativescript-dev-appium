const nsAppium = require("nativescript-dev-appium");
const addContext = require('mochawesome/addContext');

const testReporterContext = {};
testReporterContext.name = "mochawesome";

/**
 * This folder should be the one provided in mocha.opts. 
 * If omitted the default one is "mochawesome-report".
 * This is necessary because we need the logged images to be relatively 
 * positioned according to mochawesome.html in the same folder
 */
testReporterContext.reportDir = "mochawesome-report";
testReporterContext.log = addContext;
testReporterContext.logImageTypes = [nsAppium.LogImageType.screenshots];
nsAppium.nsCapabilities.testReporter = testReporterContext;

before("start server", async function () {
    nsAppium.nsCapabilities.testReporter.context = this;
    await nsAppium.startServer();
});

after("stop appium server", async function () {
    await nsAppium.stopServer();
});
