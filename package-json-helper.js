const fs = require("fs");
const path = require("path");
const utils = require("./utils");

let pendingNpmInstall = false;
let projectDir = "";

function configureDevDependencies(packageJson, adderCallback) {
    if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
    }

    let dependencies = packageJson.devDependencies;

    adderCallback(function (name, version) {
        if (!dependencies[name]) {
            dependencies[name] = version;
            console.info("Adding dev dependency: " + name + "@" + version);
            pendingNpmInstall = true;
        } else {
            console.info("Dev dependency: '" + name + "' already added. Leaving version: " + dependencies[name]);
        }
    });

    if (pendingNpmInstall) {
        console.info("Installing new dependencies...");
        //Run `npm install` after everything else.
        setTimeout(function () {
            utils.executeNpmInstall(projectDir);
        }, 100);
    }
}

exports.updatePackageJsonDep = (packageJsonPath, isTscProj) => {
    let packageJson = {};
    if (!utils.fileExists(packageJsonPath)) {
        throw Error("The path to package.json is not valid: " + packageJson);
    } else {
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        projectDir = path.dirname(packageJsonPath);
        console.log("packageJson", packageJson);
    }

    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }

    if (!packageJson.scripts["appium"]) {
        if (isTscProj) {
            packageJson.scripts["appium"] = "npm run tests-tsc && nativescript-dev-appium";
        } else {
            packageJson.scripts["appium"] = "nativescript-dev-appium";
        }
    }
    if (!packageJson.scripts["tests-watch"] && isTscProj) {
        packageJson.scripts["tests-tsc"] = "cd e2e-tests && ../node_modules/.bin/tsc  -p tsconfig-e2e-tests.json";
    }
    configureDevDependencies(packageJson, (add) => {
        add("chai", "~4.1.1");
        add("mocha", "~3.5.0");
        add('chai-as-promised', '~7.1.1');
        add('mocha-junit-reporter', '^1.13.0');
        add('wd', '^1.4.0');
        if (isTscProj) {
            add('tslib', '^1.7.1');
            add("@types/node", "^7.0.5");
        }
    });

    console.warn("WARNING: nativescript-dev-appium no longer installs Appium as a local dependency!");
    console.log("Add appium as a local dependency (see README) or we'll attempt to run it from PATH.");

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    if (fs.existsSync(packageJsonPath) && pendingNpmInstall) {
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        console.log("packageJson", packageJson);
    }
}