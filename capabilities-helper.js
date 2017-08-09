'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var utils = require("./utils");
var projectDir = utils.projectDir();
function searchCustomCapabilities(capabilitiesLocation) {
    var appParentFolder = path.dirname(projectDir);
    var customCapabilitiesLocation = capabilitiesLocation;
    var cap = {};
    if (!path.isAbsolute(capabilitiesLocation)) {
        customCapabilitiesLocation = utils.resolve(projectDir, capabilitiesLocation, utils.capabilitiesName);
    }
    if (utils.fileExists(customCapabilitiesLocation)) {
        cap = setCustomCapabilities(customCapabilitiesLocation);
    }
    else {
        console.log("START");
        cap = setCustomCapabilities(utils.searchFiles(appParentFolder, utils.capabilitiesName, true)[0]);
        console.log("END");
    }
    return cap;
}
exports.searchCustomCapabilities = searchCustomCapabilities;
function setCustomCapabilities(appiumCapabilitiesLocation) {
    var file = fs.readFileSync(appiumCapabilitiesLocation);
    process.env.APPIUM_CAPABILITIES = file;
    utils.log("Custom capabilities found at: " + appiumCapabilitiesLocation);
    return file;
}
exports.searchCustomCapabilities = searchCustomCapabilities;
