import { INsCapabilities } from "./interfaces/ns-capabilities";
import { INsCapabilitiesArgs } from "./interfaces/ns-capabilities-args";
import { AutomationName } from "./automation-name";
import { resolveCapabilities } from "./capabilities-helper";
import { getAppPath, logInfo, logError, logWarn } from "./utils";
import { IDevice } from "mobile-devices-controller";
import { IDeviceManager } from "./interfaces/device-manager";
import { existsSync } from "fs";

export class NsCapabilities implements INsCapabilities {
    private _automationName: AutomationName;

    public projectDir: string;
    public projectBinary: string;
    public pluginRoot: string;
    public pluginBinary: string;
    public port: number;
    public verbose: boolean;
    public appiumCapsLocation: string;
    public appiumCaps: any;
    public testFolder: string;
    public storage: string;
    public testReports: any;
    public reuseDevice: boolean;
    public devMode: boolean;
    public runType: string;
    public isSauceLab: boolean;
    public wdaLocalPort: number;
    public appName: string;
    public appPath: string;
    public path: string;
    public emulatorOptions: string;
    public sessionId: string;
    public capabilitiesName: string;
    public ignoreDeviceController: boolean;
    public relaxedSecurity: boolean;
    public cleanApp: boolean;
    public attachToDebug: boolean;
    public startSession: boolean;
    public isValidated: boolean;
    public device: IDevice;
    public deviceManager: IDeviceManager;
    public exceptions: Array<string> = new Array();
    public imagesPath: string;

    constructor(private _parser: INsCapabilitiesArgs) {
        this.projectDir = this._parser.projectDir;
        this.projectBinary = this._parser.projectBinary;
        this.pluginRoot = this._parser.pluginRoot;
        this.pluginBinary = this._parser.pluginBinary;
        this.appPath = this._parser.appPath;
        this.port = this._parser.port;
        this.verbose = this._parser.verbose;
        this.appiumCapsLocation = this._parser.appiumCapsLocation;
        this.relaxedSecurity = this._parser.relaxedSecurity;
        this.cleanApp = this._parser.cleanApp;
        this.attachToDebug = this._parser.attachToDebug;
        this.sessionId = this._parser.sessionId;
        this.startSession = this._parser.startSession;
        this.testFolder = this._parser.testFolder;
        this.storage = this._parser.storage;
        this.testReports = this._parser.testReports;
        this.devMode = this._parser.devMode;
        this.runType = this._parser.runType;
        this.isSauceLab = this._parser.isSauceLab;
        this.ignoreDeviceController = this._parser.ignoreDeviceController;
        this.wdaLocalPort = this._parser.wdaLocalPort;
        this.path = this._parser.path;
        this.capabilitiesName = this._parser.capabilitiesName;
        this.imagesPath = this._parser.imagesPath;
        this.appiumCaps = this._parser.appiumCaps;
    }

    // get path() { return this.path; }
    // get projectDir() { return this.projectDir; }
    // get projectBinary() { return this.projectBinary; }
    // get pluginRoot() { return this.pluginRoot; }
    // get pluginBinary() { return this.pluginBinary; }
    // get port() { return this.port; }
    // set port(port) { this.port = port; }
    // get verbose() { return this.verbose; }
    // set verbose(verbose: boolean) { this.verbose = verbose; }
    // get appiumCapsLocation() { return this.appiumCapsLocation; }
    // get appiumCaps() { return this.appiumCaps; }
    // set appiumCaps(appiumCaps) { this.appiumCaps = appiumCaps; }
    // get testFolder() { return this.testFolder; }
    // get storage() { return this.storage; }
    // get testReports() { return this.testReports; }
    // get reuseDevice() { return this.reuseDevice; }
    // get devMode() { return this.devMode; }
    // get runType() { return this.runType; }
    get isAndroid() { return this.isAndroidPlatform(); }
    get isIOS() { return !this.isAndroid; }
    // get isSauceLab() { return this.isSauceLab; }
    get automationName() { return this._automationName; }
    set automationName(automationName: AutomationName) {
        this._automationName = automationName;
    }
    // get appPath() { return this.appPath; }
    // get appName() { return this.appName; }
    // set appName(appName: string) { this.appName = appName; }
    // get ignoreDeviceController() { return this.ignoreDeviceController; }
    // set ignoreDeviceController(ignoreDeviceController: boolean) { this.ignoreDeviceController = ignoreDeviceController; }
    // get wdaLocalPort() { return this.wdaLocalPort; }
    // get device() { return this.device; }
    // set device(device: IDevice) { this.device = device; }
    // get emulatorOptions() { return (this.emulatorOptions || "-wipe-data -gpu on") }
    // get relaxedSecurity() { return this.relaxedSecurity }
    // get cleanApp() { return this.cleanApp; }
    // get attachToDebug() { return this.attachToDebug; }
    // get sessionId() { return this.sessionId; }
    // set sessionId(sessionId: string) { this.sessionId = sessionId; }
    // get startSession() { return this.startSession; }
    // get deviceManager() { return this.deviceManager; }
    // set deviceManager(deviceManager: IDeviceManager) { this.deviceManager = deviceManager; }
    // get isValidated() { return this.isValidated; }
    // get imagesPath() { return this.imagesPath; }
    //set isValidated(isValidated: boolean) { this.isValidated = isValidated; }

    setAutomationNameFromString(automationName: String) {
        const key = Object.keys(AutomationName).filter((v, i, a) => v.toLowerCase() === automationName.toLowerCase());
        this.automationName = AutomationName[key[0]];
    }

    public extend(args: INsCapabilities) {
        Object.keys(args).forEach(key => {
            if (args[key]) {
                this[`_${key}`] = args[key];
                this[`${key}`] = args[key];
            }
        });

        return this;
    }

    public validateArgs(): any {
        if (this.attachToDebug || this.sessionId) {
            this.isValidated = true;
        }

        if (!this.attachToDebug && !this.sessionId) {
            this.appiumCaps = this.appiumCaps || resolveCapabilities(this.appiumCapsLocation, this.runType, this.projectDir, this.capabilitiesName);

            this.setAutomationName();
            this.resolveApplication();
            this.checkMandatoryCapabilities();
            this.throwExceptions();
            this.shouldSetFullResetOption();
            this.isValidated = true;
        } else {
            this.isValidated = false;
        }
    }

    private isAndroidPlatform() { 
        return this.appiumCaps && this.appiumCaps ? this.appiumCaps.platformName.toLowerCase().includes("android") : undefined;
     }

    public shouldSetFullResetOption() {
        if (!this.ignoreDeviceController) {
            this.reuseDevice = !this.appiumCaps["fullReset"];
            this.appiumCaps["fullReset"] = false;
            if (!this.reuseDevice) {
                logWarn("The started device will be killed after the session!");
                logInfo("To avoid it, set 'fullReset: false' in appium capabilities.");
            }

            this.cleanApp = !this.appiumCaps["noReset"];
        }

        if (this.attachToDebug || this.devMode) {
            this.appiumCaps["fullReset"] = false;
            this.appiumCaps["noReset"] = true;
            logInfo("Changing appium setting fullReset: false and noReset: true ");
        }
    }

    private setAutomationName() {
        if (this.appiumCaps["automationName"]) {
            switch (this.appiumCaps["automationName"].toLowerCase()) {
                case AutomationName.UiAutomator2.toString().toLowerCase():
                    this.automationName = AutomationName.UiAutomator2; break;
                case AutomationName.Appium.toString().toLowerCase():
                    this.automationName = AutomationName.Appium; break;
                case AutomationName.XCUITest.toString().toLowerCase():
                    this.automationName = AutomationName.XCUITest; break;
            }
        } else {
            if (this.isAndroid) {
                if (this.tryGetAndroidApiLevel() > 6 || (this.appiumCaps["apiLevel"] && this.appiumCaps["apiLevel"].toLowerCase().includes("p"))) {
                    this.automationName = AutomationName.UiAutomator2;
                }
            }
        }

        if (this.automationName) {
            this.appiumCaps["automationName"] = this.automationName.toString();
            logInfo(`Automation name set to: ${this.appiumCaps["automationName"]}`);
            console.log(`To change automation name, you need to set it in appium capabilities!`);
        } else {
            console.log(`Appium will use default automation name`);
        }
    }

    tryGetAndroidApiLevel() {
        try {
            if (this.appiumCaps["platformVersion"]) {
                const apiLevel = this.appiumCaps["platformVersion"].split(".").splice(0, 2).join('.');
                return parseFloat(apiLevel);
            }
        } catch (error) { }
        return undefined;
    }

    private resolveApplication() {
        if (this.isSauceLab) {
            if (this.appPath) {
                this.appiumCaps.app = this.appPath.startsWith("http") ? this.appPath : `sauce-storage:${this.appPath}`;
            }

            if (!this.appiumCaps.app) {
                const errorMsg = "Neither appPath option nor capabilities.app provided!!!";
                logError(errorMsg);
                throw new Error(errorMsg);
            }

            this.appPath = this.appiumCaps.app;
            this.ignoreDeviceController = true;
            logInfo(`Using Sauce Labs. The application path is changed to: ${this.appiumCaps.app}`);
        } else {
            this.appiumCaps.app = getAppPath(this);
            this.appPath = this.appiumCaps.app;

            logInfo(`Application full path: ${this.appiumCaps.app}`);
        }
    }

    private checkMandatoryCapabilities() {
        const appPackage = this.isAndroid ? "appPackage" : "bundleId";

        if (!this.isSauceLab && (!this.appiumCaps[appPackage] && !existsSync(this.appiumCaps.app))) {
            this.exceptions.push(`The application folder doesn't exists or no ${appPackage} provided!`);
        }

        if (!this.runType && !this.appiumCaps) {
            this.exceptions.push("Missing runType or appium capabilities! Please select one from appium capabilities file!");
        }

        if (!this.appiumCaps.platformName) {
            logWarn("Platform name is missing! Please, check appium capabilities file!");
        }

        if (!this.appiumCaps.platformVersion) {
            logWarn("Platform version is missing! You'd better to set it in order to use the correct device");
        }

        if (!this.appiumCaps.deviceName && !this.appiumCaps.udid) {
            logWarn("The device name or udid are missing! Please, check appium capabilities file!");
        }
    }

    private throwExceptions() {
        this.exceptions.forEach(msg => {
            logError(msg);
        });

        if (this.exceptions.length > 0) {
            process.exit(1);
        }
    }
}