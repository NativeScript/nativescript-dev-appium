const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");

function resolve(mainPath) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!path.isAbsolute(mainPath)) {
        if (mainPath[0] === '~') {
            mainPath = path.join(process.env.HOME, mainPath.slice(1));
        } else {
            mainPath = path.resolve(dir, mainPath);
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
            console.log("File does not exist. " + p);
            return false;
        }

        console.log("Exception fs.statSync (" + path + "): " + e);
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
            console.log("CREATE Directory: ", dest);
            fs.mkdirSync(dest);
        }
        const files = getAllFileNames(src);
        const destination = dest;
        files.forEach(file => {
            const destt = path.resolve(destination, file);
            console.log("destt", destt);
            console.log("src", path.join(src, file));
            copy(path.join(src, file), destt, verbose);
        });
    } else {
        fs.writeFileSync(dest, fs.readFileSync(src));
    }
    if (verbose) {
        console.log("File " + src + " is coppied to " + dest);
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
        console.log(e.message);
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
    console.log("searchFiles folder", folder);
    const rootFiles = getAllFileNames(folder);
    console.log("searchFiles rootFiles", rootFiles);

    const regex = createRegexPattern(words);
    console.log("regex rootFiles", regex);

    rootFiles.filter(f => {
        const fileFullName = resolve(folder, f);
        console.log("searchFiles f", f);
        
        let m = regex.test(f);
        console.log("searchFiles regex", regex);
        console.log("searchFiles m", m);
        if (m) {
            files.push(fileFullName);
        } else if (isDirectory(fileFullName) && recursive) {
            searchFiles(fileFullName, words, recursive, files);
        }
    });

    console.log("searchFiles files", files);
    return files;
}
