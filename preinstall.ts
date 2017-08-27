#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import * as utils from "./utils";
import { updatePackageJsonDep } from "./package-json-helper";
const pluginRoot = utils.pluginRoot();
const projectDir = utils.projectDir;
const packageJsonPath = utils.resolve(projectDir, "package.json");
const isTscProj = utils.searchFiles(projectDir, "tsconfig*.json").length > 0;

if (path.dirname(packageJsonPath) !== "nativescript-dev-appium") {
    updatePackageJsonDep(packageJsonPath, isTscProj);
}

// Copy e2e-tests folder if doesn't exist
const e2eTests = utils.testFolder;
const e2eTestsDir = utils.resolve(projectDir, e2eTests);

if (!utils.fileExists(e2eTestsDir)) {
    fs.mkdirSync(e2eTestsDir);
    let sampleJsTestSrc = utils.resolve(pluginRoot, e2eTests);

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