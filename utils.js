const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");

const testFolder = process.env.npm_config_testFolder || "e2e";
exports.testFolder = testFolder;
const verbose = process.env.npm_config_loglevel === "verbose";
exports.verbose = verbose;
exports.mochaCustomOptions = process.env.npm_config_mochaOptions || "";
exports.capabilitiesLocation = process.env.npm_config_capsLocation || path.join(testFolder, "config");
exports.capabilitiesName = "appium.capabilities.json";
function resolve(mainPath) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    // if (isSymLink(mainPath)) {
    //     mainPath = fs.realpathSync(mainPath);
    // }
    if (!path.isAbsolute(mainPath)) {
        if (mainPath.startsWith('~')) {
            mainPath = path.join(process.env.HOME, mainPath.slice(1));
        }
        else {
            mainPath = path.resolve(cwd(), mainPath);
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
    return process.cwd();
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
    } catch (e) {
        if (e.code == 'ENOENT') {
            logErr("File does not exist. " + p);
            return false;
        }

        logErr("Exception fs.statSync (" + path + "): " + e);
        throw e;
    }
}

exports.fileExists = fileExists;

function executeNpmInstall(cwd) {
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
            log("CREATE Directory: ", dest);
            fs.mkdirSync(dest);
        }
        const files = getAllFileNames(src);
        const destination = dest;
        files.forEach(file => {
            const destt = path.resolve(destination, file);
            log("destt", destt);
            log("src", path.join(src, file));
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

exports.copy = copy;

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

function isFile(fullName) {
    try {
        if (fs.statSync(fullName).isFile()) {
            return true;
        }
    } catch (e) {
        logError(e.message);
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

function contains(source, check) {
    return source.indexOf(check) >= 0;
}

// Search for files and folders. If shoud not match, than the filter will skip this words. Could be use with wildcards
exports.searchFiles = (folder, words, recursive, files) => {
    if (files === undefined || files === null) {
        files = new Array();
    }
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

exports.log = function log(message) {
    if (verbose) {
        console.log(message);
    }
}

exports.logOut = function loglogOut(line, force) {
    if (verbose || force) {
        process.stdout.write(line);
    }
}

exports.logErr = function logErr(line, force) {
    if (verbose || force) {
        process.stderr.write(line);
    }
}
