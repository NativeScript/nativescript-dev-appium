var path = require("path");
var fs = require("fs");
var childProcess = require("child_process");

var projectDir = path.resolve(__dirname, "../", "../");
var testsDir = path.join(projectDir, "e2e-tests");
var packageJsonPath = path.join(projectDir, "package.json");

var generateSampleTest = true;

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
    var sampleTestSrc = path.join(__dirname, "sample-test.js");
    var sampleTestDest = path.join(testsDir, "sample-test.js");
    if (!fs.existsSync(sampleTestDest)) {
        var javaClassesContent = fs.readFileSync(sampleTestSrc, "utf8");
        fs.writeFileSync(sampleTestDest, javaClassesContent);
    }
}

var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

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
    var pendingNpmInstall = false;
    if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
    }
    var dependencies = packageJson.devDependencies;

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
            var spawnArgs = [];
            if (/^win/.test(process.platform)) {
                spawnArgs = ["cmd.exe", ["/c", "npm", "install"]];
            } else {
                spawnArgs = ["npm", ["install"]];
            }
            spawnArgs.push({ cwd: projectDir, stdio: "inherit" });
            var npm = childProcess.spawn.apply(null, spawnArgs);
            npm.on("close", function (code) {
                process.exit(code);
            });
        }, 100);
    }
}
