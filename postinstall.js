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
const appRootPath = require('app-root-path').toString();

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
const projectTypes = `${tsc} | ${js} | ${ng} | ${vue} | ${sharedNg} | ${sharedVue}`;
const testingFrameworks = `${mocha} | ${jasmine} | ${none}`;

const packageJsonPath = resolve(appRootPath, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

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
        console.log(`condition: ${condition} AND ${basename(src)} AND ${basename(src).includes(condition)}! Copy ${dest.replace(condition, "")} to ${src}`);

        if (condition && basename(src).includes(condition)) {
            console.log(`condition: ${condition}!.Copy ${dest.replace(condition, "")} to ${src}`);
            writeFileSync(dest.replace(condition, ""), readFileSync(src));
        } else if (!condition) {
            console.log(`condition: ${condition}!.Copy ${dest} to ${src}`);

            writeFileSync(dest, readFileSync(src));
        }
    }
}

const getDevDependencies = (projectType, frameworkType) => {
    const tesstingFrameworkDeps = new Map();

    tesstingFrameworkDeps.set(jasmine, [
        { name: "jasmine", version: "~3.2.0" },
        { name: "jasmine-core", version: "~2.99.1" },
        { name: "jasmine-spec-reporter", version: "~4.2.1" },
        { name: "@types/jasmine", version: "~2.8.8" },
    ]);

    tesstingFrameworkDeps.set(mocha, [
        { name: "mocha", version: "~5.1.0" },
        { name: "mocha-junit-reporter", version: "~1.17.0" },
        { name: "mocha-multi", version: "~1.0.0" },
        { name: "@types/mocha", version: "~5.2.1" },
        { name: "@types/chai", version: "~4.1.3" }
    ]);


    tesstingFrameworkDeps.set(js, []);

    return tesstingFrameworkDeps.get(frameworkType);

}

const configureDevDependencies = (packageJson, projectType, frameworkType) => {
    if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
    }
    const devDependencies = packageJson.devDependencies || {};

    getDevDependencies(projectType, frameworkType)
        .filter(({ name }) => !devDependencies[name])
        .forEach(({ name, version }) => {
            devDependencies[name] = version;
        });
}

const updatePackageJsonDependencies = (packageJson, projectType, testingFrameworkType) => {
    packageJson.scripts = packageJson.scripts || {};

    const checkDevDepsScript = "node ./node_modules/nativescript-dev-appium/check-dev-deps.js";
    const mochaCommand = " mocha --opts ./e2e/config/mocha.opts ";
    const jasmineCommand = " jasmine --config=./e2e/config/jasmine.json ";
    const tscTranspile = " tsc -p e2e ";

    const runner = (testingFrameworkType === none) ? undefined : (testingFrameworkType === mocha ? mochaCommand : jasmineCommand);
    const executeTestsCommand = projectType !== sharedNg ? "e2e" : "e2e-appium";
    const watchTestsCommandName = executeTestsCommand + "-watch";// = "tsc -p e2e --watch";"
    const watchTestsCommand = "tsc -p e2e --watch";

    if (!packageJson.scripts[executeTestsCommand] && runner) {
        switch (projectType) {
            case tsc:
            case ng:
            case sharedNg:
                packageJson.scripts[executeTestsCommand] = checkDevDepsScript + " && " + tscTranspile + " && " + runner;
                packageJson.scripts[watchTestsCommandName] = watchTestsCommand;
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

    configureDevDependencies(packageJson, projectType, testingFrameworkType);
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

const printLogo = () => {
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
        chalk.white.bgGreen.bold(`Done! ${filepath} is your default testing framework!`)
    );
};

const isTscProject = (PROJECT_TYPE) => { return PROJECT_TYPE === tsc || PROJECT_TYPE === ng || PROJECT_TYPE === sharedNg; }

const run = async () => {
    printLogo();

    const envProjectType = process.env.npm_config_projectType || process.env["PROJECT_TYPE"];
    const envTestsingFramework = process.env.npm_config_testsingFramework || process.env["TESTING_FRAMEWORK"];
    const hasSetProjectTypeAndTestingFrameworkAsEnvSet = envProjectType && envTestsingFramework;
    const isDevAppiumAlreadyInstalled = packageJson.devDependencies && packageJson.devDependencies["nativescript-dev-appium"];

    const skipPostInstallOnPluginRoot = basename(appRootPath) === "nativescript-dev-appium"
    if ((!hasSetProjectTypeAndTestingFrameworkAsEnvSet && isDevAppiumAlreadyInstalled) || skipPostInstallOnPluginRoot) {
        console.log("Skip instalation!!!!")
        return false;
    }

    // use env or ask questions
    const { PROJECT_TYPE } = envProjectType ? { PROJECT_TYPE: envProjectType } : await frameworkQuestion();
    const { TESTING_FRAMEWORK } = envTestsingFramework ? { TESTING_FRAMEWORK: envTestsingFramework } : await testingFrameworkQuestion();

    if (!projectTypes.includes(PROJECT_TYPE)) {
        console.error(`Please provide PROJECT_TYPE of type ${projectTypes}!`);
        return;
    }

    if (!testingFrameworks.includes(TESTING_FRAMEWORK)) {
        console.error(`Please provide testingFramework of type ${testingFrameworks}!`);
        return;
    }

    const sampleTestsProjectFolderPath = resolve(appRootPath, "e2e");
    const sampleTestsPluginFolderPath = resolve(appRootPath, "node_modules", "nativescript-dev-appium", "samples");

    if (!existsSync(sampleTestsProjectFolderPath) && TESTING_FRAMEWORK !== none) {
        mkdirSync(sampleTestsProjectFolderPath);
        const e2eSamplesFolder = isTscProject(PROJECT_TYPE) ? resolve(sampleTestsPluginFolderPath, "e2e-tsc") : resolve(sampleTestsPluginFolderPath, "e2e-js");
        if (isTscProject(PROJECT_TYPE)) {
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
        }

        console.info(`Copying ${e2eSamplesFolder} to ${sampleTestsProjectFolderPath} ...`);
        copy(e2eSamplesFolder, sampleTestsProjectFolderPath, `${TESTING_FRAMEWORK}.`);

        copy(resolve(sampleTestsPluginFolderPath, "config"), resolve(sampleTestsProjectFolderPath, "config"));
        const settingsFile = TESTING_FRAMEWORK === jasmine ? `${TESTING_FRAMEWORK}.json` : `${TESTING_FRAMEWORK}.opts`;
        copy(resolve(sampleTestsPluginFolderPath, settingsFile), resolve(sampleTestsProjectFolderPath, "config", settingsFile));
    }

    updatePackageJsonDependencies(packageJson, PROJECT_TYPE, TESTING_FRAMEWORK);
};

run();
