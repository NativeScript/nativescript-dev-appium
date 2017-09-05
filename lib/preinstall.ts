#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import * as utils from "./utils";
import { updatePackageJsonDep } from "./package-json-helper";

const appRootPath = require('app-root-path').toString();
const packageJsonPath = utils.resolve(appRootPath, "package.json");
const isTscProj = utils.searchFiles(appRootPath, "tsconfig*.json").length > 0;

if (path.dirname(packageJsonPath) !== "nativescript-dev-appium") {
    updatePackageJsonDep(packageJsonPath, appRootPath, isTscProj, true);
}

// Copy e2e-tests folder if doesn't exist
const e2eTests = "e2e";
const e2eTestsDir = utils.resolve(appRootPath, e2eTests);

if (!utils.fileExists(e2eTestsDir)) {
    fs.mkdirSync(e2eTestsDir);
    let sampleJsTestSrc = utils.resolve(appRootPath, e2eTests);

    if (isTscProj) {
        console.log("Typescript project");
        utils.copy(sampleJsTestSrc, e2eTestsDir, true);
    } else {
        let filesToCopy = utils.searchFiles(sampleJsTestSrc, "config,*.js");
        if (filesToCopy) {
            filesToCopy.forEach((f) => {
                utils.copy(sampleJsTestSrc, e2eTestsDir, true);
            });
        }
    }
}