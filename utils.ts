import * as path from "path";
import * as fs from "fs";
import * as childProcess from "child_process";
require('colors');

export const verbose = process.env.npm_config_loglevel === "verbose";
export const testFolder = process.env.npm_config_testFolder || "e2e";
export const mochaCustomOptions = process.env.npm_config_mochaOptions;
export const capabilitiesName = "appium.capabilities.json";
export const appLocation = process.env.npm_config_appLocation;
export const executionPath = process.env.npm_config_executionPath;

export function resolve(mainPath, ...args) {
    if (!path.isAbsolute(mainPath)) {
        if (mainPath.startsWith('~')) {
            mainPath = path.join(process.env.HOME, mainPath.slice(1));
        } else {
            mainPath = path.resolve(projectDir(), mainPath);
        }
    }

    let fullPath = mainPath;
    args.forEach(p => {
        fullPath = path.resolve(fullPath, p);
    });
    return fullPath;
}

export function projectDir() {
    return require('app-root-path').toString();
}

export function pluginBinary() {
    return resolve(__dirname, "node_modules", ".bin");
}

export function projectBinary() {
    return resolve(projectDir(), "node_modules", ".bin");
}

export function pluginRoot() {
    return resolve(__dirname);
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

export function executeNpmInstall(cwd) {
    let spawnArgs = [];
    let command = "";
    if (/^win/.test(process.platform)) {
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
            log("CREATE Directory: " + dest);
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
        log("File " + src + " is coppied to " + dest);
    }

    return dest;
}

function isDirectory(fullName) {
    try {
        if (fs.statSync(fullName).isDirectory()) {
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
        if (fs.statSync(fullName).isFile()) {
            return true;
        }
    } catch (e) {
        logErr(e.message, true);
        return false;
    }

    return false;
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

export function log(message) {
    if (verbose) {
        console.log(message);
    }
}

export function loglogOut(line, force) {
    if (verbose || force) {
        process.stdout.write(line);
    }
}

export function logErr(line, force) {
    if (verbose || force) {
        process.stderr.write(line);
    }
}

export function shutdown(processToKill) {
    try {
        if (processToKill) {
            if (process.platform === "win32") {
                killPid(processToKill.pid);
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

function killPid(pid) {
    let output = childProcess.execSync('taskkill /PID ' + pid + ' /T /F');
    log(output);
}

export function waitForOutput(process, matcher, timeout) {
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

export function executeCommand(args, cwd?) {
    cwd = cwd || process.cwd();
    let command;
    if (/^win/.test(process.platform)) {
        command = "cmd.exe"
    }

    const output = childProcess.spawnSync(command, args.split(" "), {
        shell: true,
        cwd: process.cwd(),
        encoding: "UTF8"
    });

    return output.output[1].trim();
}