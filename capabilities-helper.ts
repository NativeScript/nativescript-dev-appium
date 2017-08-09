
'use strict'

import * as  path from "path";
import * as fs from "fs";
import * as utils from "./utils";
const projectDir = utils.projectDir();

export function searchCustomCapabilities(capabilitiesLocation) {
    let cap = {};

    if (capabilitiesLocation) {
        cap = setCustomCapabilities(capabilitiesLocation);

        return cap;
    }

    let customCapabilitiesLocation = utils.resolve(projectDir);
    console.log("customCapabilitiesLocation ", customCapabilitiesLocation)



    customCapabilitiesLocation = utils.resolve(customCapabilitiesLocation, "e2e", "config", utils.capabilitiesName);
    if (utils.fileExists(customCapabilitiesLocation)) {
        cap = setCustomCapabilities(customCapabilitiesLocation);

        return cap;
    }

    const appParentFolder = path.dirname(projectDir);

    customCapabilitiesLocation = utils.searchFiles(appParentFolder, utils.capabilitiesName, true)[0];

    console.log("customCapabilitiesLocation ", customCapabilitiesLocation);


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