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
// const chalk = require("chalk");
// const figlet = require("figlet");

const jasmine = "jasmine";
const mocha = "mocha";
const mochawesome = "mochawesome";
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

const isWin = () => { return /^win/i.test(process.platform) };

class Template {
    constructor(testingFramwork, projectType, storage, fileExt) {
        this._testingFramwork = testingFramwork;
        this._projectType = projectType;
        this._storage = storage;
        this._fileExt = fileExt;
    }

    get testingFramwork() {
        return this._testingFramwork;
    }

    get projectType() {
        return this._projectType;
    }

    get storage() {
        return this._storage;
    }

    get fileExt() {
        return this._fileExt;
    }
}

const copy = (src, dest) => {
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
            copy(source, destination);
        });
    } else {
        writeFileSync(dest, readFileSync(src));
    }
}

const getDevDependencies = (frameworkType) => {
    if (frameworkType === jasmine) {
        return [
            { name: "jasmine", version: "~3.3.1" },
            { name: "jasmine-core", version: "~3.3.0" },
            { name: "jasmine-spec-reporter", version: "~4.2.1" },
            { name: "@types/jasmine", version: "~3.3.4" },
            { name: "@types/node", version: "~10.12.18" },
        ]
    }

    if (frameworkType === mocha) {
        const mochaDeps = [
            { name: "mocha", version: "~5.2.0" },
            { name: "mochawesome", version: "~3.1.2" },
            { name: "chai", version: "~4.1.2" },
            { name: "@types/mocha", version: "~5.2.5" },
            { name: "@types/chai", version: "~4.1.7" },
            { name: "@types/node", version: "~10.12.18" },
            { name: "mocha-junit-reporter", version: "~1.18.0" },
            { name: "mocha-multi", version: "~1.0.1" }
        ];

        return mochaDeps;
    }

    return [];
}

const configureDevDependencies = (packageJson, frameworkType) => {
    if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
    }
    const devDependencies = packageJson.devDependencies || {};

    getDevDependencies(frameworkType)
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
    const watchTestsCommandName = executeTestsCommand + "-watch";
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

    configureDevDependencies(packageJson, testingFrameworkType);
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// const printLogo = () => {
//     console.log(
//         chalk.green(
//             figlet.textSync("{ N }-dev-appium", {
//                 font: "doom",
//                 horizontalLayout: "default",
//                 verticalLayout: "default"
//             })
//         )
//     );
// };

const isInteractive = process.stdout && process.stdout.isTTY && process.stdin && process.stdin.isTTY && (!process.env || (!process.env.CI && !process.env.JENKINS_HOME));

const frameworkQuestion = () => {
    if (!isInteractive) {
        console.info("This console is not interactive! Please export env PROJECT_TYPE!")
    }
    const questions = [
        {
            type: "list",
            name: "PROJECT_TYPE",
            message: "What kind of project do you use?",
            choices: [js, tsc, ng, vue, sharedNg]
        }
    ];
    return inquirer.prompt(questions);
};

const testingFrameworkQuestion = () => {
    if (!isInteractive) {
        console.info("This console is not interactive! Please export env TESTING_FRAMEWORK!")
    }
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

const isTscProject = (PROJECT_TYPE) => { return PROJECT_TYPE === tsc || PROJECT_TYPE === ng || PROJECT_TYPE === sharedNg; }

const getTemplates = (name) => {
    const templates = new Map();

    templates.set("javascript.jasmine", new Template("jasmine", "javascript", "e2e-js", "js"));
    templates.set("javascript.mocha", new Template("mocha", "javascript", "e2e-js", "js"));
    templates.set("vue.mocha", new Template("mocha", "vue", "e2e-js", "js"));
    templates.set("vue.jasmine", new Template("jasmine", "vue", "e2e-js", "js"));
    templates.set("typescript.mocha", new Template("mocha", "typescript", "e2e-ts", "ts"));
    templates.set("angular.mocha", new Template("mocha", "typescript", "e2e-ts", "ts"));
    templates.set("typescript.jasmine", new Template("jasmine", "typescript", "e2e-ts", "ts"));
    templates.set("angular.jasmine", new Template("jasmine", "typescript", "e2e-ts", "ts"));
    templates.set("shared-ng-project.jasmine", new Template("jasmine", "shared-ng-project", "e2e-ts", "ts"));

    return templates.get(name);
}

const run = async () => {
    // printLogo();
    const envProjectType = process.env.npm_config_projectType || process.env["projectType"];
    const envTestingFramework = process.env.npm_config_testingFramework || process.env["TESTING_FRAMEWORK"];
    const hasSetProjectTypeAndTestingFrameworkAsEnvSet = envProjectType && envTestingFramework;
    const isDevAppiumAlreadyInstalled = packageJson.devDependencies && packageJson.devDependencies["nativescript-dev-appium"];

    const skipPostInstallOnPluginRoot = basename(appRootPath) === "nativescript-dev-appium"
    if ((!hasSetProjectTypeAndTestingFrameworkAsEnvSet && isDevAppiumAlreadyInstalled) || skipPostInstallOnPluginRoot) {
        console.log("Skip installation!!!!")
        return false;
    }

    // use env or ask questions
    const { PROJECT_TYPE } = envProjectType ? { PROJECT_TYPE: envProjectType } : await frameworkQuestion();
    const { TESTING_FRAMEWORK } = envTestingFramework ? { TESTING_FRAMEWORK: envTestingFramework } : await testingFrameworkQuestion();

    if (!projectTypes.includes(PROJECT_TYPE)) {
        console.error(`Please provide PROJECT_TYPE of type ${projectTypes}!`);
        return;
    }

    if (!testingFrameworks.includes(TESTING_FRAMEWORK)) {
        console.error(`Please provide testingFramework of type ${testingFrameworks}!`);
        return;
    }

    const sampleTestsProjectFolderPath = resolve(appRootPath, "e2e");
    const basicSampleTestsPluginFolderPath = resolve(appRootPath, "node_modules", "nativescript-dev-appium", "samples");

    if (!existsSync(sampleTestsProjectFolderPath) && TESTING_FRAMEWORK !== none) {
        mkdirSync(sampleTestsProjectFolderPath);
        const template = getTemplates(`${PROJECT_TYPE}.${TESTING_FRAMEWORK}`);
        const e2eSamplesFolder = resolve(basicSampleTestsPluginFolderPath, template.storage);

        if (isTscProject(template.projectType)) {
            const tsConfigJsonFile = resolve(e2eSamplesFolder, "tsconfig.json");
            const tsConfigJson = JSON.parse(readFileSync(tsConfigJsonFile, "utf8"));
            switch (template.testingFramwork) {
                case jasmine:
                    tsConfigJson.compilerOptions.types.push("jasmine");
                    tsConfigJson.compilerOptions.types.push("node");
                    break;
                case mocha:
                    tsConfigJson.compilerOptions.types.push("mocha");
                    tsConfigJson.compilerOptions.types.push("chai");
                    tsConfigJson.compilerOptions.types.push("node");
                    break;
                default:
                    break;
            }

            writeFileSync(tsConfigJsonFile, JSON.stringify(tsConfigJson, null, 2));
            copy(tsConfigJsonFile, resolve(sampleTestsProjectFolderPath, "tsconfig.json"));
        }

        const samplesFilePostfix = "sample.e2e-spec";

        const includeMochawesomeReport = template.testingFramwork === mocha ? `${mochawesome}.` : "";
        copy(resolve(e2eSamplesFolder, `${template.projectType}.${template.testingFramwork}.${samplesFilePostfix}.${includeMochawesomeReport}${template.fileExt}`), resolve(sampleTestsProjectFolderPath, `${samplesFilePostfix}.${template.fileExt}`));
        copy(resolve(e2eSamplesFolder, `${template.testingFramwork}.setup.${includeMochawesomeReport}${template.fileExt}`), resolve(sampleTestsProjectFolderPath, `setup.${template.fileExt}`));

        copy(resolve(basicSampleTestsPluginFolderPath, "config"), resolve(sampleTestsProjectFolderPath, "config"));

        const settingsFile = template.testingFramwork === jasmine ? `${template.testingFramwork}.json` : `${template.testingFramwork}.opts`;
        copy(resolve(basicSampleTestsPluginFolderPath, settingsFile), resolve(sampleTestsProjectFolderPath, "config", settingsFile));
    }

    updatePackageJsonDependencies(packageJson, PROJECT_TYPE, TESTING_FRAMEWORK);
};

run();
