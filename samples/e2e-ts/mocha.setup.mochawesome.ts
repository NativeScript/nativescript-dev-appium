import { startServer, stopServer, ITestReporter, nsCapabilities } from "nativescript-dev-appium";
const addContext = require('mochawesome/addContext');

const testReporterContext = <ITestReporter>{};
testReporterContext.name = "mochawesome";
testReporterContext.reportDir = "mochawesome-report";
testReporterContext.log = addContext;
testReporterContext.logImageVerificationStatus = false;
nsCapabilities.testReporter = testReporterContext;

before("start server", async function(){
    nsCapabilities.testReporter.context = this;
    await startServer();
});

after("stop server", async () => {
    await stopServer();
});
