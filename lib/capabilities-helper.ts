import * as glob from 'glob';
import { dirname, join } from "path";
import { readFileSync, statSync, existsSync } from "fs";
import { logInfo, logWarn, logError } from "./utils";

export function resolveCapabilities(capsLocation: string, runType: string, projectDir: string, capabilitiesName: string, verbose: boolean = false): {} {
    let caps;
    const capabilitiesConfigFile = searchCapabilities(capsLocation, projectDir, capabilitiesName, verbose);;

    if (capabilitiesConfigFile) {
        const capabilitiesObject = JSON.parse(capabilitiesConfigFile.toString());
        const runTypeCaseInSensitive = Object.getOwnPropertyNames(capabilitiesObject).filter((v, i, a) => v.toLowerCase() === runType.toLowerCase())[0];
        caps = capabilitiesObject[runTypeCaseInSensitive];
    }

    if (!caps) {
        const msg = `No capabilities of type ${runType} found! Check you appium capabilities file!`;
        logError(msg);
        logInfo(`Available capabilities:`);
        console.dir(JSON.parse(capabilitiesConfigFile.toString()));
        throw new Error(msg);
    }

    return caps;
}

export function searchCapabilities(capabilitiesLocation: string, projectDir: string, capabilitiesName: string, verbose: boolean = false) {
    let appiumCapabilitiesFile = undefined;

    if (existsSync(capabilitiesLocation) && statSync(capabilitiesLocation).isFile()) {
        appiumCapabilitiesFile = capabilitiesLocation;
        console.log(appiumCapabilitiesFile);
    }

    if (!appiumCapabilitiesFile) {
        logInfo(`Search capabilities in ${capabilitiesLocation} for ${capabilitiesName}`);
        appiumCapabilitiesFile = sreachCapabilitiesByFolder(capabilitiesLocation, capabilitiesName);
    }

    if (!appiumCapabilitiesFile) {
        logInfo(`Search capabilities in ${projectDir}`);
        appiumCapabilitiesFile = sreachCapabilitiesByFolder(projectDir, capabilitiesName)
    }

    if (!appiumCapabilitiesFile) {
        const parentRoot = dirname(projectDir);
        logInfo(`Search capabilities in ${parentRoot}`);
        appiumCapabilitiesFile = sreachCapabilitiesByFolder(parentRoot, capabilitiesName);
    }

    if (appiumCapabilitiesFile && existsSync(appiumCapabilitiesFile)) {
        return seCapabilities(appiumCapabilitiesFile);
    } else {
        logError(`We could not locate any file ${capabilitiesName}!`);
    }

    return appiumCapabilitiesFile;
}

const sreachCapabilitiesByFolder = (location, capabilitiesName) => {
    const capabiliteFiles = glob.sync(join(location, "/**/", capabilitiesName));
    logInfo('Found files:', capabiliteFiles);
    let capsFile = capabiliteFiles && capabiliteFiles.length > 0 ? capabiliteFiles[0] : undefined;
    if (capsFile) {
        logInfo('Peek first file:', capabiliteFiles[0]);
    } else {
        logWarn(`No appium capabilities file '${capabilitiesName}' found in '${location}'.`);
    }
    return capsFile;
}

const seCapabilities = appiumCapabilitiesLocation => {
    const file = readFileSync(appiumCapabilitiesLocation);
    process.env.APPIUM_CAPABILITIES = file.toString();
    logInfo(`Capabilities found at: ${appiumCapabilitiesLocation}`);
    return file;
}