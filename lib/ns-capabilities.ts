import { INsCapabilities } from "./interfaces/ns-capabilities";
import { INsCapabilitiesArgs } from "./interfaces/ns-capabilities-args";
import { AutomationName } from "./automation-name";
import { resolveCapabilities } from "./capabilities-helper";
import { getAppPath, fileExists, logInfo, logError } from "./utils";
import { IDevice } from "mobile-devices-controller";
import { IDeviceManager } from "./interfaces/device-manager";

export class NsCapabilities implements INsCapabilities {
    private _projectDir: string;
    private _projectBinary: string;
    private _pluginRoot: string;
    private _pluginBinary: string;
    private _port: number;
    private _verbose: boolean;
    private _appiumCapsLocation: string;
    private _appiumCaps: any;
    private _testFolder: string;
    private _storage: string;
    private _testReports: any;
    private _reuseDevice: boolean;
    private _devMode: boolean;
    private _runType: string;
    private _isSauceLab: boolean;
    private _wdaLocalPort: number;
    private _appName: string;
    private _appPath: string;
    private _path: string;
    private _emulatorOptions: string;
    private _sessionId: string;
    private _capabilitiesName: string;
    private _ignoreDeviceController: boolean;
    private _relaxedSecurity: boolean;
    private _cleanApp: boolean;
    private _attachToDebug: boolean;
    private _startSession: boolean;
    private _isValidated: boolean;
    private _automationName: AutomationName;
    private _device: IDevice;
    private _deviceManager: IDeviceManager;
    private _exceptions: Array<string> = new Array();

    constructor(private _parser: INsCapabilitiesArgs) {
        this._projectDir = this._parser.projectDir;
        this._projectBinary = this._parser.projectBinary;
        this._pluginRoot = this._parser.pluginRoot;
        this._pluginBinary = this._parser.pluginBinary;
        this._appPath = this._parser.appPath;
        this._port = this._parser.port;
        this._verbose = this._parser.verbose;
        this._appiumCapsLocation = this._parser.appiumCapsLocation;
        this._relaxedSecurity = this._parser.relaxedSecurity;
        this._cleanApp = this._parser.cleanApp;
        this._attachToDebug = this._parser.attachToDebug;
        this._sessionId = this._parser.sessionId;
        this._startSession = this._parser.startSession;
        this._testFolder = this._parser.testFolder;
        this._storage = this._parser.storage;
        this._testReports = this._parser.testReports;
        this._reuseDevice = this._parser.reuseDevice;
        this._devMode = this._parser.devMode;
        this._runType = this._parser.runType;
        this._isSauceLab = this._parser.isSauceLab;
        this._ignoreDeviceController = this._parser.ignoreDeviceController;
        this._wdaLocalPort = this._parser.wdaLocalPort;
        this._path = this._parser.path;
        this._capabilitiesName = this._parser.capabilitiesName;
    }

    get path() { return this._path; }
    get projectDir() { return this._projectDir; }
    get projectBinary() { return this._projectBinary; }
    get pluginRoot() { return this._pluginRoot; }
    get pluginBinary() { return this._pluginBinary; }
    get port() { return this._port; }
    set port(port) { this._port = port; }
    get verbose() { return this._verbose; }
    set verbose(verbose: boolean) { this._verbose = verbose; }
    get appiumCapsLocation() { return this._appiumCapsLocation; }
    get appiumCaps() { return this._appiumCaps; }
    set appiumCaps(appiumCaps) { this._appiumCaps = appiumCaps; }
    get testFolder() { return this._testFolder; }
    get storage() { return this._storage; }
    get testReports() { return this._testReports; }
    get reuseDevice() { return this._reuseDevice; }
    get devMode() { return this._devMode; }
    get runType() { return this._runType; }
    get isAndroid() { return this.isAndroidPlatform(); }
    get isIOS() { return !this.isAndroid; }
    get isSauceLab() { return this._isSauceLab; }
    get automationName() { return this._automationName; }
    get appPath() { return this._appPath; }
    get appName() { return this._appName; }
    set appName(appName: string) { this._appName = appName; }
    get ignoreDeviceController() { return this._ignoreDeviceController; }
    set ignoreDeviceController(ignoreDeviceController: boolean) { this._ignoreDeviceController = ignoreDeviceController; }
    get wdaLocalPort() { return this._wdaLocalPort; }
    get device() { return this._device; }
    set device(device: IDevice) { this._device = device; }
    get emulatorOptions() { return (this._emulatorOptions || "-wipe-data -gpu on") }
    get relaxedSecurity() { return this._relaxedSecurity }
    get cleanApp() { return this._cleanApp; }
    get attachToDebug() { return this._attachToDebug; }
    get sessionId() { return this._sessionId; }
    set sessionId(sessionId: string) { this._sessionId = sessionId; }
    get startSession() { return this._startSession; }
    get deviceManager() { return this._deviceManager; }
    set deviceManager(deviceManager: IDeviceManager) { this._deviceManager = deviceManager; }
    get isValidated() { return this._isValidated; }
    //set isValidated(isValidated: boolean) { this._isValidated = isValidated; }

    public extend(args: INsCapabilities) {
        Object.keys(args).forEach(key => {
            if (args[key]) {
                this[`_${key}`] = args[key];
            }
        });

        return this;
    }

    public validateArgs(): void {
        if (this._attachToDebug || this._sessionId) {
            this._isValidated = true;
        }
        if (!this._attachToDebug && !this._sessionId) {
            this._appiumCaps = resolveCapabilities(this.appiumCapsLocation, this.runType, this.projectDir, this._capabilitiesName);

            this.setAutomationName();
            this.resolveApplication();
            this.checkMandatoryCapabiliies();
            this.throwExceptions();
            this.shouldSetFullResetOption();
            this._isValidated = true;
        } else {
            this._isValidated = false;
        }
    }

    private isAndroidPlatform() { return this._appiumCaps && this._appiumCaps ? this._appiumCaps.platformName.toLowerCase().includes("android") : undefined; }

    private shouldSetFullResetOption() {
        if (this._ignoreDeviceController) {
            this.appiumCaps["fullReset"] = true;
            this.appiumCaps["noReset"] = false;
            console.log("Changing appium setting fullReset: true and noReset: false ");
        }

        if (this._attachToDebug || this._devMode) {
            this.appiumCaps["fullReset"] = false;
            this.appiumCaps["noReset"] = true;
            console.log("Changing appium setting fullReset: false and noReset: true ");
        }
    }

    private setAutomationName() {
        if (this.appiumCaps["automationName"]) {
            switch (this.appiumCaps["automationName"].toLowerCase()) {
                case AutomationName.UiAutomator2.toString().toLowerCase():
                    this._automationName = AutomationName.UiAutomator2; break;
                case AutomationName.Appium.toString().toLowerCase():
                    this._automationName = AutomationName.Appium; break;
                case AutomationName.XCUITest.toString().toLowerCase():
                    this._automationName = AutomationName.XCUITest; break;
            }
        } else {
            if (this.isAndroid) {
                if (this.tryGetAndroidApiLevel() > 6 || (this.appiumCaps["apiLevel"] && this.appiumCaps["apiLevel"].toLowerCase().includes("p"))) {
                    this._automationName = AutomationName.UiAutomator2;
                }
            }
        }

        if (this._automationName) {
            this.appiumCaps["automationName"] = this._automationName.toString();
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
            if (this.appPath){
                if (this.appPath.startsWith("http")){
                    this._appiumCaps.app = this.appPath;
                } else {
                    this._appiumCaps.app = `sauce-storage:${this.appPath}`;
                }
            } else if (!this._appiumCaps.app){
                throw new Error("Neither appPath option nor capabilities.app provided!!!");
            }
            
            this._ignoreDeviceController = true;
            console.log("Using Sauce Labs. The application path is changed to: " + this._appiumCaps.app);
        } else {
            this.appiumCaps.app = getAppPath(this);
            this._appPath = this._appiumCaps.app;
            console.log("Application full path: " + this._appiumCaps.app);
        }
    }

    private checkMandatoryCapabiliies() {
        const appPackage = this.isAndroid ? "appPackage" : "bundleId";

        if (!this.isSauceLab && (!this._appiumCaps[appPackage] && !fileExists(this._appiumCaps.app))) {
            this._exceptions.push(`The application folder doesn't exists or no ${appPackage} provided!`);
        }

        if (!this._runType) {
            this._exceptions.push("Missing runType! Please select one from appium capabilities file!");
        }

        if (!this._appiumCaps.platformName) {
            this._exceptions.push("Platform name is missing! Please, check appium capabilities file!");
        }

        if (!this._appiumCaps.platformVersion) {
            console.warn("Platform version is missing! You'd better to set it in order to use the correct device");
        }

        if (!this._appiumCaps.deviceName && !this._appiumCaps.udid) {
            this._exceptions.push("The device name or udid are missing! Please, check appium capabilities file!");
        }
    }

    private throwExceptions() {
        this._exceptions.forEach(msg => {
            logError(msg);
        });

        if (this._exceptions.length > 0) {
            process.exit(1);
        }
    }
}