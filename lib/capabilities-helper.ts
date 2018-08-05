import * as glob from 'glob';
import { dirname, join } from "path";
import { readFileSync } from "fs";
import {
    isFile,
    fileExists,
    logInfo,
    logWarn,
    logError
} from "./utils";

export function resolveCapabilities(capsLocation: string, runType: string, projectDir: string, capabilitiesName: string, verbose: boolean = false): {} {
    let caps;
    const customCapabilitiesConfigs = searchCapabilities(capsLocation, projectDir, capabilitiesName, verbose);;

    if (customCapabilitiesConfigs) {
        const customCapabilities = JSON.parse(customCapabilitiesConfigs.toString());
        logInfo(customCapabilities);
        caps = customCapabilities[runType];
    }

    if (!caps) {
        const msg = `No capabilities of type ${caps} found! Check you appium capabilities file!`;
        logError(msg);
        throw new Error(msg);
    }

    return caps;
}

export function searchCapabilities(capabilitiesLocation, projectDir, capabilitiesName, verbose: boolean = false) {
    let appiumCapabilitiesFile;
    if (isFile(capabilitiesLocation)) {
        appiumCapabilitiesFile = capabilitiesLocation;
    }

    logInfo(`Search capabilities in ${capabilitiesLocation}`);
    appiumCapabilitiesFile = sreachCapabilitiesByFolder(capabilitiesLocation, capabilitiesName);

    const logNotFoundCapsFileMsg = location => {
        if (!capabilitiesLocation) {
            logWarn(`No appium capabilities file found in ${location}`);
        }
    }
    logNotFoundCapsFileMsg(capabilitiesLocation);

    if (!appiumCapabilitiesFile) {
        logInfo(`Search capabilities in ${projectDir}`);
        appiumCapabilitiesFile = sreachCapabilitiesByFolder(projectDir, capabilitiesName)
        logNotFoundCapsFileMsg(projectDir);
    }

    if (!appiumCapabilitiesFile) {
        const parentRoot = dirname(projectDir);
        logInfo(`Search capabilities in ${parentRoot}`);
        appiumCapabilitiesFile = sreachCapabilitiesByFolder(parentRoot, capabilitiesName);
        logNotFoundCapsFileMsg(parentRoot);
    }

    if (appiumCapabilitiesFile && fileExists(appiumCapabilitiesFile)) {
        return seCapabilities(appiumCapabilitiesFile);
    } else {
        logError(`We could not locate any file ${capabilitiesName}!`);
    }

    return appiumCapabilitiesFile;
}

const sreachCapabilitiesByFolder = (location, capabilitiesName) => {
    const capabiliteFiles = glob.sync(join(location, "/**/", capabilitiesName));
    logInfo('Found files:', capabiliteFiles);
    logInfo('Peek first file:', capabiliteFiles[0]);
    return capabiliteFiles[0];
}

const seCapabilities = appiumCapabilitiesLocation => {
    const file = readFileSync(appiumCapabilitiesLocation);
    process.env.APPIUM_CAPABILITIES = file.toString();
    logInfo(`Capabilities found at: ${appiumCapabilitiesLocation}`);
    return file;
}