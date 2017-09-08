#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var utils_1 = require("./lib/utils");
var package_json_helper_1 = require("./lib/package-json-helper");
var appRootPath = require('app-root-path').toString();
var e2eTests = "e2e";
var e2eLocalFolderPath = utils_1.resolve(appRootPath, e2eTests);
var e2ePluginFolderPath = utils_1.resolve(appRootPath, "node_modules", "nativescript-dev-appium", "e2e");
var isTscProj = utils_1.searchFiles(appRootPath, "tsconfig*.json", false).length > 0;
var packageJsonPath = utils_1.resolve(appRootPath, "package.json");
if (path_1.dirname(packageJsonPath) !== "nativescript-dev-appium") {
    package_json_helper_1.updatePackageJsonDep(packageJsonPath, appRootPath, isTscProj, true);
}
if (!utils_1.fileExists(e2eLocalFolderPath)) {
    fs_1.mkdirSync(e2eLocalFolderPath);
    if (isTscProj) {
        console.log("TypeScript project: adding a test sample ...");
        utils_1.copy(e2ePluginFolderPath, e2eLocalFolderPath, true);
    }
    else {
        console.log("JavaScript project: not adding a test sample ...");
    }
}
