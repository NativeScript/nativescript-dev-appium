import { dirname } from "path";
import { readFileSync } from "fs";
import * as utils from "./utils";
import * as parser from "./parser";

export function resolveCapabilities(capsLocation: string, runType: string, projectDir: string, verbose: boolean = false): {} {
    let caps;
    let customCapabilitiesConfigs: any = searchCustomCapabilities(capsLocation, projectDir);
    if (customCapabilitiesConfigs) {
        const customCapabilities = JSON.parse(customCapabilitiesConfigs);
        utils.log(customCapabilities, verbose);

        caps = customCapabilities[runType];
        if (!caps) {
            throw new Error("Not suitable runType!!!");
        }
    } else {
        throw new Error("No capabilities found!!!");
    }

    return caps;
}

export function searchCustomCapabilities(capabilitiesLocation, projectDir, verbose: boolean = false) {
    // resolve capabilites if exist
    if (utils.fileExists(capabilitiesLocation) && utils.isFile(capabilitiesLocation)) {
        return setCustomCapabilities(capabilitiesLocation, verbose);
    }

    // search for default capabilites
    let customCapabilitiesLocation = utils.searchFiles(projectDir, parser.capabilitiesName)[0];
    if (utils.fileExists(customCapabilitiesLocation)) {
        return setCustomCapabilities(customCapabilitiesLocation, verbose);
    }

    // search in parent folder for capabilities
    const appParentFolder = dirname(projectDir);
    customCapabilitiesLocation = utils.searchFiles(appParentFolder, parser.capabilitiesName, true)[0];

    if (utils.fileExists(customCapabilitiesLocation)) {
        return setCustomCapabilities(customCapabilitiesLocation, verbose);
    } else {
        // search for capabilities recursive 
        let cap = utils.searchFiles(appParentFolder, parser.capabilitiesName, verbose)[0];
        if (cap) {
            setCustomCapabilities(cap, verbose);
        }
    }

    throw Error("No capabilities found!!!");
}

function setCustomCapabilities(appiumCapabilitiesLocation, verbose: boolean = false) {
    const file = readFileSync(appiumCapabilitiesLocation);
    process.env.APPIUM_CAPABILITIES = file;
    utils.log("Custom capabilities found at: " + appiumCapabilitiesLocation, verbose);
    return file;
}