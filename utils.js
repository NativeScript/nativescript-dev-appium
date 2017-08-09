"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var childProcess = require("child_process");
exports.verbose = process.env.npm_config_loglevel === "verbose";
exports.testFolder = process.env.npm_config_testFolder || "e2e";
exports.mochaCustomOptions = process.env.npm_config_mochaOptions;
exports.capabilitiesName = "appium.capabilities.json";
exports.appLocation = process.env.npm_config_appLocation;
exports.executionPath = process.env.npm_config_executionPath;
function resolve(mainPath) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!path.isAbsolute(mainPath)) {
        if (mainPath.startsWith('~')) {
            mainPath = path.join(process.env.HOME, mainPath.slice(1));
        }
        else {
            mainPath = path.resolve(projectDir(), mainPath);
        }
    }
    var fullPath = mainPath;
    args.forEach(function (p) {
        fullPath = path.resolve(fullPath, p);
    });
    return fullPath;
}
exports.resolve = resolve;
function projectDir() {
    return require('app-root-path').toString();
}
exports.projectDir = projectDir;
function pluginBinary() {
    return resolve(__dirname, "node_modules", ".bin");
}
exports.pluginBinary = pluginBinary;
function projectBinary() {
    return resolve(projectDir(), "node_modules", ".bin");
}
exports.projectBinary = projectBinary;
function pluginRoot() {
    return resolve(__dirname);
}
exports.pluginRoot = pluginRoot;
function fileExists(p) {
    try {
        if (fs.existsSync(p)) {
            return true;
        }
        return false;
    }
    catch (e) {
        if (e.code == 'ENOENT') {
            logErr("File does not exist. " + p, true);
            return false;
        }
        logErr("Exception fs.statSync (" + path + "): " + e, true);
        throw e;
    }
}
exports.fileExists = fileExists;
function executeNpmInstall(cwd) {
    var spawnArgs = [];
    var command = "";
    if (/^win/.test(process.platform)) {
        command = "cmd.exe";
        spawnArgs = ["/c", "npm", "install"];
    }
    else {
        command = "npm";
        spawnArgs = ["install"];
    }
    var npm = childProcess.spawnSync(command, spawnArgs, { cwd: cwd, stdio: "inherit" });
}
exports.executeNpmInstall = executeNpmInstall;
function copy(src, dest, verbose) {
    if (!fileExists(src)) {
        return Error("Cannot copy: " + src + ". Source doesn't exist: " + dest);
    }
    if (fileExists(src) && isFile(src) && isDirectory(dest)) {
        dest = path.join(dest, path.basename(src));
    }
    if (isDirectory(src)) {
        if (!fileExists(dest)) {
            log("CREATE Directory: " + dest);
            fs.mkdirSync(dest);
        }
        var files = getAllFileNames(src);
        var destination_1 = dest;
        files.forEach(function (file) {
            var destt = path.resolve(destination_1, file);
            copy(path.join(src, file), destt, verbose);
        });
    }
    else {
        fs.writeFileSync(dest, fs.readFileSync(src));
    }
    if (verbose) {
        log("File " + src + " is coppied to " + dest);
    }
    return dest;
}
exports.copy = copy;
function isDirectory(fullName) {
    try {
        if (fs.statSync(fullName).isDirectory()) {
            return true;
        }
    }
    catch (e) {
        console.log(e.message);
        return false;
    }
    return false;
}
function isFile(fullName) {
    try {
        if (fs.statSync(fullName).isFile()) {
            return true;
        }
    }
    catch (e) {
        logErr(e.message, true);
        return false;
    }
    return false;
}
function getAllFileNames(folder) {
    var files = new Array();
    fs.readdirSync(resolve(folder)).forEach(function (file) {
        files.push(file);
    });
    return files;
}
/// ^nativ\w*(.+).gz$ native*.gz
/// \w*nativ\w*(.+)\.gz$ is like *native*.gz
/// \w*nativ\w*(.+)\.gz\w*(.+)$ is like *native*.gz*
function createRegexPattern(text) {
    var finalRex = "";
    text.split(",").forEach(function (word) {
        word = word.trim();
        var searchRegex = word;
        if (word !== "" && word !== " ") {
            searchRegex = searchRegex.replace(".", "\\.");
            searchRegex = searchRegex.replace("*", "\\w*(.+)?");
            if (!word.startsWith("*")) {
                searchRegex = "^" + searchRegex;
            }
            if (!word.endsWith("*")) {
                searchRegex += "$";
            }
            if (!contains(finalRex, searchRegex)) {
                finalRex += searchRegex + "|";
            }
        }
    });
    finalRex = finalRex.substring(0, finalRex.length - 1);
    var regex = new RegExp(finalRex, "gi");
    return regex;
}
function contains(source, check) {
    return source.indexOf(check) >= 0;
}
exports.contains = contains;
// Search for files and folders. If shoud not match, than the filter will skip this words. Could be use with wildcards
function searchFiles(folder, words, recursive, files) {
    if (recursive === void 0) { recursive = true; }
    if (files === void 0) { files = new Array(); }
    var rootFiles = getAllFileNames(folder);
    var regex = createRegexPattern(words);
    rootFiles.filter(function (f) {
        var fileFullName = resolve(folder, f);
        var m = regex.test(f);
        if (m) {
            files.push(fileFullName);
        }
        else if (isDirectory(fileFullName) && recursive) {
            searchFiles(fileFullName, words, recursive, files);
        }
    });
    return files;
}
exports.searchFiles = searchFiles;
function log(message) {
    if (exports.verbose) {
        console.log(message);
    }
}
exports.log = log;
exports.log = log;
function loglogOut(line, force) {
    if (exports.verbose || force) {
        process.stdout.write(line);
    }
}
exports.loglogOut = loglogOut;
exports.logOut = loglogOut;
function logErr(line, force) {
    if (exports.verbose || force) {
        process.stderr.write(line);
    }
}
exports.logErr = logErr;
function shutdown(processToKill) {
    if (processToKill) {
        if (process.platform === "win32") {
            killPid(processToKill.pid);
        }
        else {
            processToKill.kill();
        }
        processToKill = null;
    }
}
exports.shutdown = shutdown;
function killPid(pid) {
    var output = childProcess.execSync('taskkill /PID ' + pid + ' /T /F');
}
function waitForOutput(process, matcher, timeout) {
    return new Promise(function (resolve, reject) {
        var abortWatch = setTimeout(function () {
            process.kill();
            console.log("Timeout expired, output not detected for: " + matcher);
            reject(new Error("Timeout expired, output not detected for: " + matcher));
        }, timeout);
        process.stdout.on("data", function (data) {
            var line = "" + data;
            if (matcher.test(line)) {
                clearTimeout(abortWatch);
                resolve();
            }
        });
    });
}
exports.waitForOutput = waitForOutput;
