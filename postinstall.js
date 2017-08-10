"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var utils = require("./utils");
var package_json_helper_1 = require("./package-json-helper");
var pluginRoot = utils.pluginRoot();
var projectDir = utils.projectDir();
var packageJsonPath = utils.resolve(projectDir, "package.json");
var isTscProj = utils.searchFiles(projectDir, "tsconfig*.json").length > 0;
if (path.dirname(packageJsonPath) !== "nativescript-dev-appium") {
    package_json_helper_1.updatePackageJsonDep(packageJsonPath, isTscProj);
}
// Copy e2e-tests folder if doesn't exist
var e2eTests = utils.testFolder;
var e2eTestsDir = utils.resolve(projectDir, e2eTests);
if (!utils.fileExists(e2eTestsDir)) {
    fs.mkdirSync(e2eTestsDir);
    var sampleJsTestSrc_1 = utils.resolve(pluginRoot, e2eTests);
    if (isTscProj) {
        console.log("Typescript project");
        utils.copy(sampleJsTestSrc_1, e2eTestsDir, true);
    }
    else {
        var filesToCopy = utils.searchFiles(sampleJsTestSrc_1, "config,*.js");
        if (filesToCopy) {
            filesToCopy.forEach(function (f) {
                utils.copy(sampleJsTestSrc_1, e2eTestsDir, true);
            });
        }
    }
}
//# sourceMappingURL=postinstall.js.map