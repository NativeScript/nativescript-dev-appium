const fs = require("fs");
const path = require("path");
import * as  utils from "./utils";

let pendingNpmInstall = false;

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
            utils.executeNpmInstall(utils.projectDir());
        }, 100);
    }
}

export function updatePackageJsonDep(packageJsonPath, isTscProj) {
    let packageJson: any = {};
    if (!utils.fileExists(packageJsonPath)) {
        console.error(packageJson, true);

        return
    } else {
        utils.log("PackageJsonPath: " + packageJsonPath);
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        const projectDir = path.dirname(packageJsonPath);
        utils.log(packageJson);
    }

    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }

    if (!packageJson.scripts["e2e"]) {
        if (isTscProj) {
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
         if (isTscProj) {
            add('tslib', '^1.7.1');
            add("@types/node", "^7.0.5");
            add("@types/chai", "^4.0.2");
            add("@types/mocha", "^2.2.41");
        }
    });

    console.warn("WARNING: nativescript-dev-appium no longer installs Appium as a local dependency!");
    console.log("Add appium as a local dependency (see README) or we'll attempt to run it from PATH.");

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    if (fs.existsSync(packageJsonPath) && pendingNpmInstall) {
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        utils.log(packageJson);
    }
}