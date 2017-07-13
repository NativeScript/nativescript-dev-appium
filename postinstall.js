const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");
const projectDir = path.resolve(__dirname, "../", "../");
const testsDir = path.join(projectDir, "e2e-tests");
const packageJsonPath = path.join(projectDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

let generateSampleTest = true;

try {
    console.log("projectDir" + projectDir);
    console.log("packageJsonPath" + packageJsonPath);
    fs.mkdirSync(testsDir);
} catch (e) {
    console.log("Test directory already exists: " + testsDir);
    console.log("Skipping sample test generation.");
    generateSampleTest = false;
}

if (generateSampleTest) {
    let sampleTestSrc = path.join(__dirname, "sample-test.js");
    let sampleTestDest = path.join(testsDir, "sample-test.js");
    if (!fs.existsSync(sampleTestDest)) {
        let javaClassesContent = fs.readFileSync(sampleTestSrc, "utf8");
        fs.writeFileSync(sampleTestDest, javaClassesContent);
    }
}

if (!packageJson.scripts) {
    packageJson.scripts = {};
}
if (!packageJson.scripts["appium"]) {
    packageJson.scripts["appium"] = "nativescript-dev-appium";
}

configureDevDependencies(packageJson, function (add) {
    add("chai", "~3.5.0");
    add("chai-as-promised", "~5.3.0");
    add("wd", "~1.1.1");
});

console.warn("WARNING: nativescript-dev-appium no longer installs Appium as a local dependency!");
console.log("Add appium as a local dependency (see README) or we'll attempt to run it from PATH.");

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

function configureDevDependencies(packageJson, adderCallback) {
    let pendingNpmInstall = false;
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
            let spawnArgs = [];
            if (/^win/.test(process.platform)) {
                spawnArgs = ["cmd.exe", ["/c", "npm", "install"]];
            } else {
                spawnArgs = ["npm", ["install"]];
            }
            spawnArgs.push({ cwd: projectDir, stdio: "inherit" });
            const npm = childProcess.spawn.apply(null, spawnArgs);
            npm.on("close", function (code) {
                process.exit(code);
            });
        }, 100);
    }
}
