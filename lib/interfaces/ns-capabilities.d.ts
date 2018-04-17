import { IDevice } from "mobile-devices-controller";
export interface INsCapabilities {
    projectDir: string;
    projectBinary: string;
    pluginRoot: string;
    pluginBinary: string;
    port: number;
    verbose: boolean;
    appiumCapsLocation: string;
    appiumCaps: any;
    testFolder: string;
    runType: string;
    isAndroid: boolean;
    isIOS: boolean;
    isSauceLab: boolean;
    appPath: string;
    appName: string;
    emulatorOptions: string;
    storage: string;
    testReports: string;
    reuseDevice: boolean;
    devMode: boolean;
    device: IDevice;
    ignoreDeviceController: boolean;
    wdaLocalPort: number;
    path: string;
}
