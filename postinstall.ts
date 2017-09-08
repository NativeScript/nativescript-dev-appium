#!/usr/bin/env node

import { mkdirSync} from "fs";
import { dirname } from "path";
import { copy, fileExists, resolve, searchFiles } from "./lib/utils";
import { updatePackageJsonDep } from "./lib/package-json-helper";

const appRootPath = require('app-root-path').toString();
const e2eTests = "e2e";
const e2eLocalFolderPath = resolve(appRootPath, e2eTests);
const e2ePluginFolderPath = resolve(appRootPath, "node_modules", "nativescript-dev-appium", "e2e")
const isTscProj = searchFiles(appRootPath, "tsconfig*.json", false).length > 0;
const packageJsonPath = resolve(appRootPath, "package.json");

if (dirname(packageJsonPath) !== "nativescript-dev-appium") {
    updatePackageJsonDep(packageJsonPath, appRootPath, isTscProj, true);
}

if (!fileExists(e2eLocalFolderPath)) {
    mkdirSync(e2eLocalFolderPath);
    if (isTscProj) {
        console.log("TypeScript project: adding a test sample ...");
        copy(e2ePluginFolderPath, e2eLocalFolderPath, true);
    } else {
        console.log("JavaScript project: not adding a test sample ...");
    }
}
