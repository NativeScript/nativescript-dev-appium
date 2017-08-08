'use strict'

const path = require("path");
const fs = require("fs");
const utils = require("./utils");
const projectDir = utils.projectDir();

function searchCustomCapabilities(capabilitiesLocation) {
    const appParentFolder = path.dirname(projectDir);
    let customCapabilitiesLocation = capabilitiesLocation;
    let cap = "";
    if (!path.isAbsolute(capabilitiesLocation)) {
        customCapabilitiesLocation = utils.resolve(projectDir, capabilitiesLocation, utils.capabilitiesName);
    }

    if (utils.fileExists(customCapabilitiesLocation)) {
        cap = setCustomCapabilities(customCapabilitiesLocation);
    } else {
        cap = setCustomCapabilities(utils.searchFiles(appParentFolder, fileName, true)[0]);
    }

    return cap;
}

function setCustomCapabilities(appiumCapabilitiesLocation) {
    const file = fs.readFileSync(appiumCapabilitiesLocation);
    process.env.APPIUM_CAPABILITIES = file;
    utils.log("Custom capabilities found at: " + appiumCapabilitiesLocation);
    return file;
}

exports.searchCustomCapabilities = searchCustomCapabilities;