const path = require("path");
const fs = require("fs");
const utils = require("./utils");
const updatePackageJsonDep = require("./package-json-helper").updatePackageJsonDep;
const pluginRoot = utils.pluginRoot();
const projectDir = utils.projectDir();
const packageJsonPath = utils.resolve(projectDir, "package.json");
const isTscProj = utils.searchFiles(projectDir, "tsconfig*.json").length > 0;

updatePackageJsonDep(packageJsonPath, isTscProj);

// Copy e2e-tests folder if doesn't exist
const e2eTests = utils.testFolder;
const e2eTestsDir = utils.resolve(projectDir, e2eTests);
if (!utils.fileExists(e2eTestsDir)) {
    fs.mkdirSync(e2eTestsDir);
    let sampleJsTestSrc = utils.resolve(pluginRoot, e2eTests);
    if (isTscProj) {
        utils.copy(sampleJsTestSrc, e2eTestsDir, true);
    } else {
        let filesToCopy = utils.searchFiles(sampleJsTestSrc, "config,*.js");
        filesToCopy.foreach((f) => {
            utils.copy(sampleJsTestSrc, e2eTestsDir, true);
        });
    }
}
