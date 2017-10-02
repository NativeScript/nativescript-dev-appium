#!/usr/bin/env node

const { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } = require("fs");
const { basename, resolve } = require("path");

const appRootPath = require('app-root-path').toString();
const childProcess = require("child_process");
const e2eTests = "e2e";
const e2eProjectFolderPath = resolve(appRootPath, e2eTests);
const e2ePluginFolderPath = resolve(appRootPath, "node_modules", "nativescript-dev-appium", "e2e");
const packageJsonPath = resolve(appRootPath, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const isTypeScriptProject =
    (
        packageJson.dependencies &&
        packageJson.dependencies.hasOwnProperty("typescript")
    ) || (
        packageJson.devDependencies &&
        packageJson.devDependencies.hasOwnProperty("typescript")
    );
const isWin = /^win/.test(process.platform);

if (basename(appRootPath) !== "nativescript-dev-appium") {
    updatePackageJsonDependencies(packageJson, isTypeScriptProject);
}

if (!existsSync(e2eProjectFolderPath)) {
    mkdirSync(e2eProjectFolderPath);
    if (isTypeScriptProject) {
        console.info("TypeScript project - adding a sample test ...");
        copy(e2ePluginFolderPath, e2eProjectFolderPath);
    } else {
        console.info("JavaScript project - not adding a sample test ...");
    }
}

function copy(src, dest) {
    if (!existsSync(src)) {
        return Error("Source doesn't exist: " + src);
    }
    if (statSync(src).isDirectory()) {
        if (!existsSync(dest)) {
            mkdirSync(dest);
        }

        const entries = new Array();
        readdirSync(resolve(src)).forEach(entry => {
            entries.push(entry);
        });

        entries.forEach(entry => {
            const source = resolve(src, entry);
            const destination = resolve(dest, entry);
            console.info("Copying " + source + " to " + destination + " ...");
            copy(source, destination);
        });
    } else {
        writeFileSync(dest, readFileSync(src));
    }
}

function executeNpmInstall(cwd) {
    let spawnArgs = [];
    let command = "";
    if (isWin) {
        command = "cmd.exe"
        spawnArgs = ["/c", "npm", "install"];
    } else {
        command = "npm"
        spawnArgs = ["install"];
    }
    childProcess.spawnSync(command, spawnArgs, { cwd, stdio: "inherit" });
}

function configureDevDependencies(packageJson, adderCallback) {
    if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
    }

    let pendingNpmInstall = false;
    const devDependencies = packageJson.devDependencies;
    adderCallback(function (name, version) {
        if (!devDependencies[name]) {
            devDependencies[name] = version;
            console.info("Adding devDependency: '" + name + "@" + version + "' ...");
            pendingNpmInstall = true;
        } else {
            console.info("devDependency: '" + name + "@" + version + "' already added.");
        }
    });

    if (pendingNpmInstall) {
        console.info("Installing new devDependencies ...");
        // Execute `npm install` after everything else
        setTimeout(function () {
            executeNpmInstall(appRootPath);
        }, 300);
    }
}

function updatePackageJsonDependencies(packageJson, isTypeScriptProject) {
    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }

    if (!packageJson.scripts["e2e"]) {
        if (isTypeScriptProject) {
            packageJson.scripts["e2e"] = "tsc -p e2e && mocha --opts ./e2e/config/mocha.opts";
            packageJson.scripts["compile-tests"] = "tsc -p e2e --watch";
        } else {
            packageJson.scripts["e2e"] = "mocha --opts ./e2e/config/mocha.opts";
        }
    }

    configureDevDependencies(packageJson, (add) => {
        add("chai", "~4.1.1");
        add("mocha", "~3.5.0");
        add('mocha-junit-reporter', '^1.13.0');
        add('mocha-multi', '^0.11.0');
        add('chai-as-promised', '~7.1.1');
        if (isTypeScriptProject) {
            add('tslib', '^1.7.1');
            add("@types/node", "^7.0.5");
            add("@types/chai", "^4.0.2");
            add("@types/mocha", "^2.2.41");
        }
    });

    console.warn("WARNING: nativescript-dev-appium no longer installs Appium as a local dependency!");
    console.info("Add appium as a local dependency (see README) or we'll attempt to run it from PATH.");

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}