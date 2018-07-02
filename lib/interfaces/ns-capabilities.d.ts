import { IDevice } from "mobile-devices-controller";
export declare enum AutomationName {
    UiAutomator2 = "UIAutomator2",
    Appium = "Appium",
    XCUITest = "XCUITest"
}
export interface INsCapabilities {
    projectDir: string;
    projectBinary: string;
    pluginRoot: string;
    pluginBinary: string;
    port: number;
    attachToDebug: boolean;
    sessionId: string;
    startSession: boolean;
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
    automationName: AutomationName;
    relaxedSecurity: boolean;
    cleanApp: boolean;
}
