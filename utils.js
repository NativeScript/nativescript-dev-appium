const path = require("path");

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
    args.forEach(function(p) {
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