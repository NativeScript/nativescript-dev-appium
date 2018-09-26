const { basename, resolve } = require("path");
const { existsSync, readFileSync } = require("fs");
const childProcess = require("child_process");
const appRootPath = require('app-root-path').toString();
const packageJsonPath = resolve(appRootPath, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const isWin = /^win/.test(process.platform);


const executeNpmInstall = (cwd, devDependenciesToInstall) => {
    let spawnArgs = [];
    let command = "";
    if (isWin) {
        command = "cmd.exe"
        spawnArgs = ["/c", "npm", "install"];
    } else {
        command = "npm"
        spawnArgs = ["install"];
    }

    if (devDependenciesToInstall && devDependenciesToInstall.length > 0) {
        spawnArgs = ["install", "-D", ...devDependenciesToInstall];
    }

    childProcess.spawnSync(command, spawnArgs, { cwd, stdio: "inherit" });
}

if (basename(appRootPath) !== "nativescript-dev-appium") {
    const devDependencies = packageJson.devDependencies;
    const modulesPath = resolve(appRootPath, "node_modules");
    const devDependenciesToInstall = Object.keys(devDependencies).filter((name => !existsSync(resolve(modulesPath, name))));
    if (devDependenciesToInstall && devDependenciesToInstall.length > 0) {
        executeNpmInstall(appRootPath, devDependenciesToInstall)
    }
}