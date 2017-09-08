import * as path from "path";
import * as fs from "fs";
import * as childProcess from "child_process";
import * as glob from "glob";

require('colors');
import { INsCapabilities } from "./ins-capabilities";

export function resolve(mainPath, ...args) {
    if (!path.isAbsolute(mainPath)) {
        if (mainPath.startsWith('~')) {
            mainPath = path.join(process.env.HOME, mainPath.slice(1));
        } else {
            mainPath = path.resolve(mainPath);
        }
    }

    let fullPath = mainPath;
    args.forEach(p => {
        fullPath = path.resolve(fullPath, p);
    });
    return fullPath;
}

export function fileExists(p) {
    try {
        if (fs.existsSync(p)) {
            return true;
        }

        return false;
    } catch (e) {
        if (e.code == 'ENOENT') {
            logErr("File does not exist. " + p, true);
            return false;
        }

        logErr("Exception fs.statSync (" + path + "): " + e, true);
        throw e;
    }
}

function isDirectory(fullName) {
    try {
        if (fileExists(fullName) && fs.statSync(fullName).isDirectory()) {
            return true;
        }
    } catch (e) {
        console.log(e.message);
        return false;
    }

    return false;
}

export function isFile(fullName) {
    try {
        if (fileExists(fullName) && fs.statSync(fullName).isFile()) {
            return true;
        }
    } catch (e) {
        logErr(e.message, true);
        return false;
    }

    return false;
}

export function executeNpmInstall(cwd) {
    let spawnArgs = [];
    let command = "";
    if (isWin()) {
        command = "cmd.exe"
        spawnArgs = ["/c", "npm", "install"];
    } else {
        command = "npm"
        spawnArgs = ["install"];
    }
    const npm = childProcess.spawnSync(command, spawnArgs, { cwd: cwd, stdio: "inherit" });
}

export function copy(src, dest, verbose) {
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
        const files = getAllFileNames(src);
        const destination = dest;
        files.forEach(file => {
            const destt = path.resolve(destination, file);
            copy(path.join(src, file), destt, verbose);
        });
    } else {
        fs.writeFileSync(dest, fs.readFileSync(src));
    }
    if (verbose) {
        console.info("File " + src + " is coppied to " + dest);
    }

    return dest;
}

function getAllFileNames(folder) {
    let files = new Array();
    fs.readdirSync(resolve(folder)).forEach(file => {
        files.push(file);
    });

    return files;
}

/// ^nativ\w*(.+).gz$ native*.gz
/// \w*nativ\w*(.+)\.gz$ is like *native*.gz
/// \w*nativ\w*(.+)\.gz\w*(.+)$ is like *native*.gz*
function createRegexPattern(text) {
    let finalRex = "";
    text.split(",").forEach(word => {
        word = word.trim();
        let searchRegex = word;
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
    const regex = new RegExp(finalRex, "gi");
    return regex;
}

export function contains(source, check) {
    return source.indexOf(check) >= 0;
}

// Search for files and folders. If shoud not match, than the filter will skip this words. Could be use with wildcards
export function searchFiles(folder, words, recursive: boolean = true, files = new Array()): Array<string> {
    const rootFiles = getAllFileNames(folder);
    const regex = createRegexPattern(words);
    rootFiles.filter(f => {
        const fileFullName = resolve(folder, f);
        let m = regex.test(f);
        if (m) {
            files.push(fileFullName);
        } else if (isDirectory(fileFullName) && recursive) {
            searchFiles(fileFullName, words, recursive, files);
        }
    });

    return files;
}

export function log(message, verbose) {
    if (verbose) {
        console.log(message);
    }
}

export function loglogOut(line, verbose) {
    if (verbose) {
        process.stdout.write(line);
    }
}

export function logErr(line, verbose) {
    if (verbose) {
        process.stderr.write(line);
    }
}

export function shutdown(processToKill, verbose) {
    try {
        if (processToKill) {
            if (process.platform === "win32") {
                killPid(processToKill.pid, verbose);
            } else {
                processToKill.kill();
            }
            processToKill = null;
            console.log("Shut down!!!");
        }
    } catch (error) {
        logErr(error, true);
    }
}

export function killPid(pid, verbose) {
    let output = childProcess.execSync('taskkill /PID ' + pid + ' /T /F');
    log(output, verbose);
}

export function waitForOutput(process, matcher, errorMatcher, timeout, verbose) {
    return new Promise<boolean>(function (resolve, reject) {
        let abortWatch = setTimeout(function () {
            process.kill();
            console.log("Timeout expired, output not detected for: " + matcher);
            resolve(false);
        }, timeout);

        process.stdout.on("data", function (data) {
            let line = "" + data;
            log(line, verbose);
            if (matcher.test(line)) {
                clearTimeout(abortWatch);
                resolve(true);
            }
            if (errorMatcher.test(line)) {
                clearTimeout(abortWatch);
                resolve(false);
            }
        });
    });
}

export function executeCommand(args, cwd?): string {
    cwd = cwd || process.cwd();

    const output = childProcess.spawnSync("", args.split(" "), {
        shell: true,
        cwd: process.cwd(),
        encoding: "UTF8"
    });

    return output.output[1].toString();
}

export function isWin() {
    return /^win/.test(process.platform);
}

export function getStorage(args: INsCapabilities) {
    let storage = createStorageFolder(resolve(args.projectDir, args.testFolder), "resources");
    storage = createStorageFolder(storage, "images");
    const appName = args.appiumCaps.app.substring(args.appiumCaps.app.lastIndexOf("/") + 1, args.appiumCaps.app.lastIndexOf("."));
    storage = createStorageFolder(storage, appName);
    storage = createStorageFolder(storage, args.appiumCaps.deviceName);

    return storage;
}

export function getAppPath(platform, runType) {
    if (platform.includes("android")) {
        const apks = glob.sync("platforms/android/build/outputs/apk/*.apk").filter(function (file) { return file.indexOf("unaligned") < 0; });
        return apks[0];
    } else if (platform.includes("ios")) {
        if (runType.includes("sim")) {
            const simulatorApps = glob.sync("platforms/ios/build/emulator/**/*.app");
            return simulatorApps[0];
        } else if (runType.includes("device")) {
            const deviceApps = glob.sync("platforms/ios/build/device/**/*.ipa");
            return deviceApps[0];
        }
    } else {
        throw new Error("No 'app' capability provided and incorrect 'runType' convention used: " + runType +
            ". In order to automatically search and locate app package please use 'android','ios-device','ios-simulator' in your 'runType' option. E.g --runType android23, --runType ios-simulator10iPhone6");
    }
};

function createStorageFolder(storage, direcotry) {
    storage = resolve(storage, direcotry)
    if (!fileExists(storage)) {
        fs.mkdirSync(storage);
    }

    return storage;
}