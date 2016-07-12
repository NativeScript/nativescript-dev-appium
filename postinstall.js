var path = require("path");
var fs = require("fs");

var projectDir = path.dirname(path.dirname(__dirname));
var testsDirSrc = path.join(__dirname, "features");
var testsDirDest = path.join(projectDir, "features");
var stepDefinitionsSrc = path.join(testsDirSrc, "step_definitions");
var stepDefinitionsDest = path.join(testsDirDest, "step_definitions");
var supportSrc = path.join(testsDirSrc, "support");
var supportDest = path.join(testsDirDest, "support");
var packageJsonPath = path.join(projectDir, "package.json");

var generateSampleTest = true;

try {
    fs.mkdirSync(testsDirDest);
    fs.mkdirSync(stepDefinitionsDest);
    fs.mkdirSync(supportDest);
} catch (e) {
    console.log("Test directory already exists: " + testsDirDest);
    console.log("Skipping sample test generation.");
    generateSampleTest = false;
}

if (generateSampleTest) {
    var content;
    var fileSrc;
    var fileDest;
    
    fileSrc = path.join(testsDirSrc, "sample.feature");
    fileDest = path.join(testsDirDest, "sample.feature");
    if (!fs.existsSync(fileDest)) {
        content = fs.readFileSync(fileSrc, "utf8");
        fs.writeFileSync(fileDest, content);
    }

    fileSrc = path.join(stepDefinitionsSrc, "step_sample.js");
    fileDest = path.join(stepDefinitionsDest, "step_sample.js");
    if (!fs.existsSync(fileDest)) {
        content = fs.readFileSync(fileSrc, "utf8");
        fs.writeFileSync(fileDest, content);
    }

    fileSrc = path.join(supportSrc, "env.js");
    fileDest = path.join(supportDest, "env.js");
    if (!fs.existsSync(fileDest)) {
        content = fs.readFileSync(fileSrc, "utf8");
        fs.writeFileSync(fileDest, content);
    }

    fileSrc = path.join(supportSrc, "world.js");
    fileDest = path.join(supportDest, "world.js");
    if (!fs.existsSync(fileDest)) {
        content = fs.readFileSync(fileSrc, "utf8");
        fs.writeFileSync(fileDest, content);
    }
}

var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

if (!packageJson.scripts) {
    packageJson.scripts = {};
}
if (!packageJson.scripts["cucumber-android"]) {
    packageJson.scripts["cucumber-android"] = "tns build android && nativescript-dev-cucumber android";
}
if (!packageJson.scripts["cucumber-ios-simulator"]) {
    packageJson.scripts["cucumber-ios-simulator"] = "tns build ios && nativescript-dev-cucumber ios-simulator";
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

