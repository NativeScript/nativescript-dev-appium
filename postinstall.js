#!/usr/bin/env node

const {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    statSync,
    writeFileSync
} = require("fs");

const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");

const jasmine = "jasmine";
const mocha = "mocha";
const none = "none";
const js = "javascript";
const tsc = "typescript";
const ng = "angular"
const vue = "vue"
const sharedNg = "shared-ng-project"
const sharedVue = "shared-vue-project"

const { basename, resolve } = require("path");
const appRootPath = require('app-root-path').toString();
const sampleTestsFolder = "samples";
const e2eTests = "e2e";
const sampleTestsProjectFolderPath = resolve(appRootPath, e2eTests);
const sampleTestsPluginFolderPath = resolve(appRootPath, "node_modules", "nativescript-dev-appium", sampleTestsFolder);
const packageJsonPath = resolve(appRootPath, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const callInstalationScripts = basename(appRootPath) !== "nativescript-dev-appium" && !(packageJson.devDependencies && packageJson.devDependencies["nativescript-dev-appium"]);

// let isTypeScriptProject =
//     (packageJson.dependencies && packageJson.dependencies.hasOwnProperty("typescript"))
//     || (packageJson.devDependencies && packageJson.devDependencies.hasOwnProperty("typescript"));

const copy = (src, dest, condition) => {
    if (!existsSync(src)) {
        return Error("Source doesn't exist: " + src);
    }

    if (statSync(src).isDirectory()) {
        if (!existsSync(dest)) {
            console.log(`Create folder ${dest}`);
            mkdirSync(dest);
        }

        const entries = new Array();
        readdirSync(resolve(src)).forEach(entry => {
            entries.push(entry);
        });

        entries.forEach(entry => {
            const source = resolve(src, entry);
            const destination = resolve(dest, entry);
            copy(source, destination, condition);
        });
    } else {
        if (condition && basename(src).includes(condition)) {
            writeFileSync(dest.replace(condition, ""), readFileSync(src));
        } else if (!condition) {
            writeFileSync(dest, readFileSync(src));
        }
    }
}

const getDevDependencies = (frameworkType) => {
    const tesstingFrameworkDeps = new Map();

    tesstingFrameworkDeps.set(jasmine, [
        { name: "jasmine", version: "~3.2.0" },
        { name: "@types/jasmine", version: "~3.0.0" },
        { name: "jasmine-core", version: "~2.99.1" },
        { name: "jasmine-spec-reporter", version: "~4.2.1" },
    ]);

    tesstingFrameworkDeps.set(mocha, [
        { name: "mocha", version: "~5.1.0" },
        { name: "mocha-junit-reporter", version: "~1.17.0" },
        { name: "mocha-multi", version: "~1.0.0" },
        { name: "@types/chai", version: "~4.1.3" },
        { name: "@types/mocha", version: "~5.2.1" },
    ]);

    tesstingFrameworkDeps.set(js, []);

    return tesstingFrameworkDeps.get(frameworkType);

}

const configureDevDependencies = (packageJson, frameworkType) => {
    if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
    }

    const devDependencies = packageJson.devDependencies;
    const newDevDependencies = getDevDependencies(frameworkType);
    const devDependenciesToInstall = newDevDependencies.filter(({ name }) => !devDependencies[name]);

    const newDevDependenciesToInstall = []
    devDependenciesToInstall.forEach(({ name, version }) => {
        if (!devDependencies[name]) {
            devDependencies[name] = version;
            newDevDependenciesToInstall.push(`${name}@${version}`)
        } else {
            console.info(`Skip installing ${name} because already exists!`);
        }
    });

    return newDevDependenciesToInstall;
}

const updatePackageJsonDependencies = (packageJson, projectType, testingFrameworkType) => {
    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }

    const checkDevDepsScript = "node ./node_modules/nativescript-dev-appium/check-dev-deps.js";
    const mocha = " mocha --opts ./e2e/config/mocha.opts ";
    const jasmine = " jasmine --config=./e2e/config/jasmine.json ";
    const tscTranspile = " tsc -p e2e ";
    const runner = testingFrameworkType === none ? undefined : testingFrameworkType === mocha ? mocha : jasmine;
    const executeTestsCommand = projectType !== sharedNg ? "e2e" : "e2e-appium";

    if (!packageJson.scripts[executeTestsCommand] && runner) {
        switch (projectType) {
            case tsc:
            case ng:
                packageJson.scripts[executeTestsCommand] = checkDevDepsScript + " && " + tscTranspile + " && " + runner;
                packageJson.scripts[executeTestsCommand + "-watch"] = "tsc -p e2e --watch";
                break;
            case sharedNg:
                packageJson.scripts[executeTestsCommand] = checkDevDepsScript + " && " + tscTranspile + " && " + runner;
                packageJson.scripts[executeTestsCommand + "-appium"] = "tsc -p e2e --watch";
                break;
            case js:
            case vue:
            case sharedVue:
                packageJson.scripts[executeTestsCommand] = checkDevDepsScript + " && " + runner;
                break;
            default:
                break;
        }
    }

    configureDevDependencies(packageJson, testingFrameworkType);
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

const init = () => {
    console.log(
        chalk.green(
            figlet.textSync("{ N }-dev-appium", {
                font: "doom",
                horizontalLayout: "default",
                verticalLayout: "default"
            })
        )
    );
};

const frameworkQuestion = () => {
    const questions = [
        {
            type: "list",
            name: "PROJECT_TYPE",
            message: "What kind of project do you use?",
            choices: [js, tsc, ng, vue, sharedNg, sharedVue]
        }
    ];
    return inquirer.prompt(questions);
};

const testingFrameworkQuestion = () => {
    const questions = [
        {
            type: "list",
            name: "TESTING_FRAMEWORK",
            message: "Which testing framework do you prefer?",
            choices: [mocha, jasmine, none]
        }
    ];
    return inquirer.prompt(questions);
};

const success = filepath => {
    console.dir(filepath)
    console.log(
        chalk.white.bgGreen.bold(`Done! ${filepath} is your defautl testing framework!`)
    );
};

const run = async () => {
    // show script introduction
    init();

    // ask questions
    const { PROJECT_TYPE } = await frameworkQuestion();
    const { TESTING_FRAMEWORK } = await testingFrameworkQuestion();

    console.log(`e2e folder ${sampleTestsProjectFolderPath}`)
    if (!existsSync(sampleTestsProjectFolderPath)) {
        mkdirSync(sampleTestsProjectFolderPath);
        let e2eSamplesFolder;
        if (PROJECT_TYPE !== js && PROJECT_TYPE !== vue && PROJECT_TYPE !== sharedVue && TESTING_FRAMEWORK !== none) {
            console.info(`Adding typescript sample config and test ...`);
            e2eSamplesFolder = resolve(sampleTestsPluginFolderPath, "e2e-tsc");
            const tsConfigJsonFile = resolve(e2eSamplesFolder, "tsconfig.json");
            const tsConfigJson = JSON.parse(readFileSync(tsConfigJsonFile, "utf8"));
            switch (TESTING_FRAMEWORK) {
                case jasmine:
                    tsConfigJson.compilerOptions.types.push("jasmine");
                    break;
                case mocha:
                    tsConfigJson.compilerOptions.types.push("mocha");
                    tsConfigJson.compilerOptions.types.push("chai");
                    break;
                default:
                    break;
            }

            writeFileSync(tsConfigJsonFile, JSON.stringify(tsConfigJson, null, 2));
            copy(tsConfigJsonFile, resolve(sampleTestsProjectFolderPath, "tsconfig.json"));
        } else if (PROJECT_TYPE === js && TESTING_FRAMEWORK !== none) {
            console.info("Adding javascript sample config and test ...");
            e2eSamplesFolder = resolve(sampleTestsPluginFolderPath, "e2e-js");
        }

        if (TESTING_FRAMEWORK !== none) {
            console.info(`Copying ${e2eSamplesFolder} to ${sampleTestsProjectFolderPath} ...`);
            copy(e2eSamplesFolder, sampleTestsProjectFolderPath, TESTING_FRAMEWORK + ".");

            copy(resolve(sampleTestsPluginFolderPath, "config"), resolve(sampleTestsProjectFolderPath, "config"));
            const settinsFile = TESTING_FRAMEWORK === jasmine ? `${TESTING_FRAMEWORK}.json` : `${TESTING_FRAMEWORK}.opts`;
            copy(resolve(sampleTestsPluginFolderPath, settinsFile), resolve(sampleTestsProjectFolderPath, "config", settinsFile));
        }
    }

    updatePackageJsonDependencies(packageJson, PROJECT_TYPE, TESTING_FRAMEWORK);
};

if (callInstalationScripts) {
    run();
}