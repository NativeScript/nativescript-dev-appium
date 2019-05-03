const nsAppium = require("nativescript-dev-appium");
const addContext = require('mochawesome/addContext');

const testReporterContext = {};
testReporterContext.name = "mochawesome";
testReporterContext.log = addContext;
testReporterContext.logImageVerificationStatus = false;
nsAppium.nsCapabilities.testReporter = testReporterContext;

before("start server", async function(){
    nsCapabilities.testReporter.context = this;
    await startServer();
});

after("stop appium server", async () => {
    await nsAppium.stopServer();
});
