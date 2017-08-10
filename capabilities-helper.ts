import * as  path from "path";
import * as fs from "fs";
import * as utils from "./utils";
const projectDir = utils.projectDir();

export function searchCustomCapabilities(capabilitiesLocation) {
    // resolve capabilites if exist
    if (utils.fileExists(capabilitiesLocation) && utils.isFile(capabilitiesLocation)) {
        return setCustomCapabilities(capabilitiesLocation);
    }

    // search for default capabilites
    let customCapabilitiesLocation = utils.searchFiles(projectDir, utils.capabilitiesName)[0];
    if (utils.fileExists(customCapabilitiesLocation)) {
        return setCustomCapabilities(customCapabilitiesLocation);
    }

    // search in parent folder for capabilities
    const appParentFolder = path.dirname(projectDir);
    customCapabilitiesLocation = utils.searchFiles(appParentFolder, utils.capabilitiesName, true)[0];

    if (utils.fileExists(customCapabilitiesLocation)) {
        return setCustomCapabilities(customCapabilitiesLocation);
    } else {
        // search for capabilities recursive 
        let cap = utils.searchFiles(appParentFolder, utils.capabilitiesName, true)[0];
        if (cap) {
            setCustomCapabilities(cap);
        }
    }

    throw Error("No capabilities found!!!");
}

function setCustomCapabilities(appiumCapabilitiesLocation) {
    const file = fs.readFileSync(appiumCapabilitiesLocation);
    process.env.APPIUM_CAPABILITIES = file;
    utils.log("Custom capabilities found at: " + appiumCapabilitiesLocation);
    return file;
}