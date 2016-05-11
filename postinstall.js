var path = require("path");
var fs = require("fs");

var projectDir = path.dirname(path.dirname(__dirname));
var testsDir = path.join(projectDir, "e2e-tests");
var packageJsonPath = path.join(projectDir, "package.json");

try {
    fs.mkdirSync(testsDir);
} catch (e) {
    console.log("Test directory already exists: " + testsDir);
}

var sampleTestSrc = path.join(__dirname, "sample-test.js");
var sampleTestDest = path.join(testsDir, "sample-test.js");
if (!fs.existsSync(sampleTestDest)) {
    var javaClassesContent = fs.readFileSync(sampleTestSrc, "utf8");
    fs.writeFileSync(sampleTestDest, javaClassesContent);
}

var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
if (!packageJson.scripts) {
    packageJson.scripts = {};
}
if (!packageJson.scripts["appium-android"]) {
    packageJson.scripts["appium-android"] = "nativescript-dev-appium";
}
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, "    "));

