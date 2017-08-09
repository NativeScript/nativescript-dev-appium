
'use strict'

import * as  path from "path";
import * as fs from "fs";
import * as utils from "./utils";
const projectDir = utils.projectDir();

export function searchCustomCapabilities(capabilitiesLocation) {
    const appParentFolder = path.dirname(projectDir);
    let customCapabilitiesLocation = capabilitiesLocation;
    let cap = {};
    if (!path.isAbsolute(capabilitiesLocation)) {
        customCapabilitiesLocation = utils.resolve(projectDir, capabilitiesLocation, utils.capabilitiesName);
    }

    if (utils.fileExists(customCapabilitiesLocation)) {
        cap = setCustomCapabilities(customCapabilitiesLocation);
    } else {
        console.log("START")
        cap = setCustomCapabilities(utils.searchFiles(appParentFolder, utils.capabilitiesName, true)[0]);
        console.log("END")
    
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