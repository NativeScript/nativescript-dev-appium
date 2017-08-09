'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var utils = require("./utils");
var projectDir = utils.projectDir();
function searchCustomCapabilities(capabilitiesLocation) {
    var cap = {};
    if (capabilitiesLocation) {
        cap = setCustomCapabilities(capabilitiesLocation);
        return cap;
    }
    var customCapabilitiesLocation = utils.resolve(projectDir);
    console.log("customCapabilitiesLocation ", customCapabilitiesLocation);
    customCapabilitiesLocation = utils.resolve(customCapabilitiesLocation, "e2e", "config", utils.capabilitiesName);
    if (utils.fileExists(customCapabilitiesLocation)) {
        cap = setCustomCapabilities(customCapabilitiesLocation);
        return cap;
    }
    var appParentFolder = path.dirname(projectDir);
    customCapabilitiesLocation = utils.searchFiles(appParentFolder, utils.capabilitiesName, true)[0];
    console.log("customCapabilitiesLocation ", customCapabilitiesLocation);
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
//# sourceMappingURL=capabilities-helper.js.map