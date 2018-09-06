#!/usr/bin/env node

const {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    statSync,
    writeFileSync
} = require("fs");
const { basename, resolve } = require("path");
const childProcess = require("child_process");
const appRootPath = require('app-root-path').toString();

const sampleTestsFolder = "samples";
const e2eTests = "e2e";
const sampleTestsProjectFolderPath = resolve(appRootPath, e2eTests);
const sampleTestsPluginFolderPath = resolve(appRootPath, "node_modules", "nativescript-dev-appium", sampleTestsFolder);
const packageJsonPath = resolve(appRootPath, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

const isTypeScriptProject =
    (packageJson.dependencies && packageJson.dependencies.hasOwnProperty("typescript"))
    || (packageJson.devDependencies && packageJson.devDependencies.hasOwnProperty("typescript"));
const isWin = /^win/.test(process.platform);

const executeNpmInstall = cwd => {
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

const copy = (src, dest) => {
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
            copy(source, destination);
        });
    } else {
        console.log(`Copy ${dest} to ${src}`)
        writeFileSync(dest, readFileSync(src));
    }
}

const getDevDependencies = () => {
    // These are nativescript-dev-appium plugin's dependencies.
    // There is NO need to explicitly install them to the project.
    // const requiredDevDependencies = [
    //     { name: "chai", version: "~4.1.1" },
    //     { name: "chai-as-promised", version: "~7.1.1" },
    //     { name: "mocha", version: "~5.2.0" },
    //     { name: "mocha-junit-reporter", version: "^1.13.0" },
    //     { name: "mocha-multi", version: "^1.0.1" },
    // ];

    // These are nativescript-dev-appium plugin's devDependencies.
    // There is need to explicitly install them to the project.
    // const typeScriptDevDependencies = [
    //     { name: "@types/chai", version: "~4.1.3" },
    //     { name: "@types/mocha", version: "~5.2.1" },
    //     { name: "@types/node", version: "^7.0.5" },
    // ];

    // return isTypeScriptProject ?
    //     [
    //         ...requiredDevDependencies,
    //         ...typeScriptDevDependencies,
    //     ] :
    //     requiredDevDependencies;

    return !isTypeScriptProject ? [] :
        [
            { name: "@types/chai", version: "~4.1.3" },
            { name: "@types/mocha", version: "~5.2.1" },
            { name: "@types/node", version: "^7.0.5" },
        ];
}

const configureDevDependencies = packageJson => {
    if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
    }

    const devDependencies = packageJson.devDependencies;
    const newDevDependencies = getDevDependencies();
    const devDependenciesToInstall = newDevDependencies.filter(({ name }) => !devDependencies[name]);
    devDependenciesToInstall.forEach(({ name, version }) => devDependencies[name] = version);

    if (devDependenciesToInstall.length) {
        console.info("Installing new devDependencies ...");
        // Execute `npm install` after everything else
        setTimeout(function () {
            executeNpmInstall(appRootPath);
        }, 300);
    }
}

const updatePackageJsonDependencies = (packageJson, isTypeScriptProject) => {
    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }

    if (!packageJson.scripts["e2e"]) {
        if (isTypeScriptProject) {
            packageJson.scripts["e2e"] = "tsc -p e2e && mocha --opts ./e2e/config/mocha.opts";
            packageJson.scripts["e2e-watch"] = "tsc -p e2e --watch";
        } else {
            packageJson.scripts["e2e"] = "mocha --opts ./e2e/config/mocha.opts";
        }
    }

    configureDevDependencies(packageJson);
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

if (basename(appRootPath) !== "nativescript-dev-appium") {
    updatePackageJsonDependencies(packageJson, isTypeScriptProject);
    if (!existsSync(sampleTestsProjectFolderPath)) {
        mkdirSync(sampleTestsProjectFolderPath);
        if (isTypeScriptProject) {
            console.info(`TypeScript project - adding sample config and test ...`);
            const tscSampleTestsPath = resolve(sampleTestsPluginFolderPath, "e2e-tsc")
            console.info(`Copying ${tscSampleTestsPath} to ${sampleTestsProjectFolderPath} ...`);
            copy(tscSampleTestsPath, sampleTestsProjectFolderPath);
        } else {
            const jsSampleTestsPath = resolve(sampleTestsPluginFolderPath, "e2e-js")
            console.info("JavaScript project - adding sample config and test ...");
            console.info(`Copying ${jsSampleTestsPath} to ${sampleTestsProjectFolderPath} ...`);
            copy(jsSampleTestsPath, sampleTestsProjectFolderPath);
        }
    }
}

