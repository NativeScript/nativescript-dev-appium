import { dirname, join } from "path";
import { readFileSync } from "fs";
import * as utils from "./utils";
import * as parser from "./parser";
import * as glob from 'glob';

export function resolveCapabilities(capsLocation: string, runType: string, projectDir: string, verbose: boolean = false): {} {
    let caps;
    const customCapabilitiesConfigs = searchCapabilities(capsLocation, projectDir, verbose);;

    if (customCapabilitiesConfigs) {
        const customCapabilities = JSON.parse(customCapabilitiesConfigs + "");
        utils.log(customCapabilities, verbose);

        caps = customCapabilities[runType];
        if (!caps) {
        }
    } else {
        throw new Error("No capabilities found!!!");
    }

    return caps;
}

export function searchCapabilities(capabilitiesLocation, projectDir, verbose: boolean = false) {
    if (utils.isFile(capabilitiesLocation)) {
        return seCapabilities(capabilitiesLocation);
    }

    console.log(`Search capabilities in ${capabilitiesLocation}`);
    let customCapabilitiesLocation = sreachCapabilitiesByFolder(capabilitiesLocation);

    if (!customCapabilitiesLocation || customCapabilitiesLocation.length === 0) {
        console.log(`Search capabilities in ${projectDir}`);

        customCapabilitiesLocation = sreachCapabilitiesByFolder(projectDir)
    }

    if (!customCapabilitiesLocation || customCapabilitiesLocation.length === 0) {
        console.log(`Search capabilities in ${dirname(projectDir)}`);
        customCapabilitiesLocation = sreachCapabilitiesByFolder(dirname(projectDir))
    }

    if (customCapabilitiesLocation && customCapabilitiesLocation.length > 0 && utils.fileExists(customCapabilitiesLocation)) {
        return seCapabilities(customCapabilitiesLocation[0]);
    }

    throw Error("No capabilities found!!!");
}

const sreachCapabilitiesByFolder = (location) => {
    const capabiliteFiles = glob.sync(join(location, "/**/", parser.capabilitiesName));
    console.log('Found files:', capabiliteFiles);
    return capabiliteFiles[0];
}

const seCapabilities = appiumCapabilitiesLocation => {
    const file = readFileSync(appiumCapabilitiesLocation);
    process.env.APPIUM_CAPABILITIES = file.toString();
    utils.log("Capabilities found at: " + appiumCapabilitiesLocation, true);
    return file;
}