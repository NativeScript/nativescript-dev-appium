var path = require("path");
var fs = require("fs");

var projectDir = path.dirname(path.dirname(__dirname));
var testsDir = path.join(projectDir, "e2e-tests");
var packageJsonPath = path.join(projectDir, "package.json");

var generateSampleTest = true;

try {
    fs.mkdirSync(testsDir);
} catch (e) {
    console.log("Test directory already exists: " + testsDir);
    console.log("Skipping sample test generation.");
    generateSampleTest = false;
}

if (generateSampleTest) {
    var sampleTestSrc = path.join(__dirname, "sample-test.js");
    var sampleTestDest = path.join(testsDir, "sample-test.js");
    if (!fs.existsSync(sampleTestDest)) {
        var javaClassesContent = fs.readFileSync(sampleTestSrc, "utf8");
        fs.writeFileSync(sampleTestDest, javaClassesContent);
    }
}

var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

if (!packageJson.scripts) {
    packageJson.scripts = {};
}
if (!packageJson.scripts["appium-android"]) {
    packageJson.scripts["appium-android"] = "tns build android && nativescript-dev-appium android";
}
if (!packageJson.scripts["appium-ios-simulator"]) {
    packageJson.scripts["appium-ios-simulator"] = "tns build ios && nativescript-dev-appium ios-simulator";
}

var newDeps = new Map();
newDeps.set("chai", "^3.5.0");
newDeps.set("chai-as-promised", "^5.3.0");
newDeps.set("wd", "0.4.0");
if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
}
for (var key of newDeps.keys()) {
    if (!packageJson.devDependencies[key]) {
        packageJson.devDependencies[key] = newDeps.get(key);
    }
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, "    "));

