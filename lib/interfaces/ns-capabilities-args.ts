import { IDevice } from "mobile-devices-controller";
import { IDeviceManager } from "./device-manager";
import { AutomationName } from "../automation-name";
import { ITestReporter } from "./test-reporter";
import { LogImageType } from "../enums/log-image-type";

export interface INsCapabilitiesArgs {
    derivedDataPath?: string;
    port?: number;
    wdaLocalPort?: number;
    projectDir?: string;
    projectBinary?: string;
    pluginRoot?: string;
    pluginBinary?: string;
    testFolder?: string;
    sessionId?: string;
    appiumCapsLocation?: string;
    runType?: string;
    appPath?: string;
    appName?: string;
    emulatorOptions?: string;
    storage?: string;
    testReports?: string;
    path?: string;
    capabilitiesName?: string;
    attachToDebug?: boolean;
    startSession?: boolean;
    verbose?: boolean;
    isAndroid?: boolean;
    isIOS?: boolean;
    isSauceLab?: boolean;
    isKobiton?: boolean;
    reuseDevice?: boolean;
    ignoreDeviceController?: boolean;
    relaxedSecurity?: boolean,
    devMode?: boolean;
    cleanApp?: boolean,
    isValidated?: boolean,
    appiumCaps?: any;
    device?: IDevice;
    automationName?: AutomationName;
    deviceManager?: IDeviceManager;
    imagesPath?: string;
    startDeviceOptions?: string;
    deviceTypeOrPlatform?: string
    driverConfig?: any;
    testReporter?: ITestReporter;
    logImageTypes?: Array<LogImageType>;
    storageByDeviceName?: string;
    storageByPlatform?: string;
    reportsPath?: string;
}