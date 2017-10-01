"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path = require("path");
var fs = require("fs");
var childProcess = require("child_process");
var glob = require("glob");
require('colors');
var point_1 = require("./point");
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
            mainPath = path.resolve(mainPath);
        }
    }
    var fullPath = mainPath;
    args.forEach(function (p) {
        fullPath = path.resolve(fullPath, p);
    });
    return fullPath;
}
exports.resolve = resolve;
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
function isDirectory(fullName) {
    try {
        if (fileExists(fullName) && fs.statSync(fullName).isDirectory()) {
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
        if (fileExists(fullName) && fs.statSync(fullName).isFile()) {
            return true;
        }
    }
    catch (e) {
        logErr(e.message, true);
        return false;
    }
    return false;
}
exports.isFile = isFile;
function executeNpmInstall(cwd) {
    var spawnArgs = [];
    var command = "";
    if (isWin()) {
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
            console.info("CREATE Directory: " + dest);
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
        console.info("File " + src + " is coppied to " + dest);
    }
    return dest;
}
exports.copy = copy;
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
// Search for files and folders. If should not match, than the filter will skip this words. Could be use with wildcards
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
function log(message, verbose) {
    if (verbose) {
        console.log(message);
    }
}
exports.log = log;
function loglogOut(line, verbose) {
    if (verbose) {
        process.stdout.write(line);
    }
}
exports.loglogOut = loglogOut;
function logErr(line, verbose) {
    if (verbose) {
        process.stderr.write(line);
    }
}
exports.logErr = logErr;
function shutdown(processToKill, verbose) {
    try {
        if (processToKill && processToKill !== null) {
            if (process.platform === "win32") {
                killPid(processToKill.pid, verbose);
            }
            else {
                processToKill.kill();
            }
            processToKill = null;
            console.log("Shut down!!!");
        }
    }
    catch (error) {
        logErr(error, verbose);
    }
}
exports.shutdown = shutdown;
function killPid(pid, verbose) {
    var output = childProcess.execSync('taskkill /PID ' + pid + ' /T /F');
    log(output, verbose);
}
exports.killPid = killPid;
function waitForOutput(process, matcher, errorMatcher, timeout, verbose) {
    return new Promise(function (resolve, reject) {
        var abortWatch = setTimeout(function () {
            process.kill();
            console.log("Timeout expired, output not detected for: " + matcher);
            resolve(false);
        }, timeout);
        process.stdout.on("data", function (data) {
            var line = "" + data;
            log(line, verbose);
            if (errorMatcher.test(line)) {
                clearTimeout(abortWatch);
                resolve(false);
            }
            if (matcher.test(line)) {
                clearTimeout(abortWatch);
                resolve(true);
            }
        });
    });
}
exports.waitForOutput = waitForOutput;
function executeCommand(args, cwd) {
    cwd = cwd || process.cwd();
    var output = childProcess.spawnSync("", args.split(" "), {
        shell: true,
        cwd: process.cwd(),
        encoding: "UTF8"
    });
    return output.output[1].toString();
}
exports.executeCommand = executeCommand;
function isWin() {
    return /^win/.test(process.platform);
}
exports.isWin = isWin;
function getStorage(args) {
    var storage = args.storage;
    if (!storage) {
        storage = createStorageFolder(resolve(args.projectDir, args.testFolder), "resources");
        storage = createStorageFolder(storage, "images");
    }
    var appName = getAppName(args);
    storage = createStorageFolder(storage, appName);
    storage = createStorageFolder(storage, args.appiumCaps.deviceName);
    return storage;
}
exports.getStorage = getStorage;
function getReportPath(args) {
    var report = args.testReports;
    if (!report) {
        report = createStorageFolder(resolve(args.projectDir, args.testFolder), "reports");
    }
    var appName = getAppName(args);
    report = createStorageFolder(report, appName);
    report = createStorageFolder(report, args.appiumCaps.deviceName);
    return report;
}
exports.getReportPath = getReportPath;
function getAppName(args) {
    var appName = args.appiumCaps.app
        .substring(args.appiumCaps.app.lastIndexOf("/") + 1, args.appiumCaps.app.lastIndexOf("."))
        .replace("-release", "").replace("-debug", "");
    return appName;
}
function getAppPath(platform, runType) {
    if (platform.includes("android")) {
        var apks = glob.sync("platforms/android/build/outputs/apk/*.apk").filter(function (file) { return file.indexOf("unaligned") < 0; });
        return apks[0];
    }
    else if (platform.includes("ios")) {
        if (runType.includes("sim")) {
            var simulatorApps = glob.sync("platforms/ios/build/emulator/**/*.app");
            return simulatorApps[0];
        }
        else if (runType.includes("device")) {
            var deviceApps = glob.sync("platforms/ios/build/device/**/*.ipa");
            return deviceApps[0];
        }
    }
    else {
        throw new Error("No 'app' capability provided and incorrect 'runType' convention used: " + runType +
            ". In order to automatically search and locate app package please use 'android','device','sim' in your 'runType' option. E.g --runType android25, --runType sim.iPhone7.iOS110");
    }
}
exports.getAppPath = getAppPath;
function calculateOffset(direction, y, yOffset, x, xOffset, isIOS, verbose) {
    var speed = 10;
    var yEnd = Math.abs(yOffset);
    var xEnd = Math.abs(xOffset);
    var duration = Math.abs(yEnd) * speed;
    if (isIOS) {
        speed = 100;
        if (direction === 0 /* down */) {
            direction = -1;
            yEnd = direction * yEnd;
        }
        if (direction === 3 /* right */) {
            direction = -1;
            xEnd = direction * xEnd;
        }
    }
    else {
        if (direction === 0 /* down */) {
            yEnd = Math.abs(yOffset - y);
        }
        if (direction === 1 /* up */) {
            yEnd = direction * Math.abs((Math.abs(yOffset) + y));
        }
        duration = Math.abs(yOffset) * speed;
        if (direction === 3 /* right */) {
            xEnd = Math.abs(xOffset - x);
        }
        if (direction === 2 /* left */) {
            xEnd = Math.abs(xOffset + x);
        }
        if (yOffset < xOffset && x) {
            duration = Math.abs(xOffset) * speed;
        }
    }
    log({ point: new point_1.Point(xEnd, yEnd), duration: duration }, verbose);
    return { point: new point_1.Point(xEnd, yEnd), duration: duration };
}
exports.calculateOffset = calculateOffset;
/**
 * Scrolls from point to other point with minimum inertia
 * @param y
 * @param x
 * @param yOffset
 * @param xOffset
 */
function scroll(wd, driver, direction, isIOS, y, x, yOffset, xOffset, verbose) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var endPoint, action;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (x === 0) {
                        x = 20;
                    }
                    if (y === 0) {
                        y = 20;
                    }
                    endPoint = calculateOffset(direction, y, yOffset, x, xOffset, isIOS, verbose);
                    action = new wd.TouchAction(driver);
                    action
                        .press({ x: x, y: y })
                        .wait(endPoint.duration)
                        .moveTo({ x: endPoint.point.x, y: endPoint.point.y })
                        .release();
                    return [4 /*yield*/, action.perform()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, driver.sleep(150)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.scroll = scroll;
function createStorageFolder(storage, direcotry) {
    storage = resolve(storage, direcotry);
    if (!fileExists(storage)) {
        fs.mkdirSync(storage);
    }
    return storage;
}
//# sourceMappingURL=utils.js.map