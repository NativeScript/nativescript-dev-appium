import * as parser from "./parser"
import { INsCapabilities, AutomationName } from "./interfaces/ns-capabilities";
import { resolveCapabilities } from "./capabilities-helper";
import { getAppPath, fileExists, logErr } from "./utils";
import { IDevice } from "mobile-devices-controller";

export class NsCapabilities implements INsCapabilities {
    private _projectDir;
    private _projectBinary;
    private _pluginRoot;
    private _pluginBinary;
    private _port;
    private _verbose;
    private _appiumCapsLocation;
    private _appiumCaps;
    private _testFolder;
    private _storage;
    private _testReports;
    private _reuseDevice;
    private _devMode;
    private _runType;
    private _isAndroid;
    private _isIOS;
    private _isSauceLab;
    private _appName: string;
    private _appPath: string;
    private _path: string;
    private _emulatorOptions: string;
    private _automationName: AutomationName;
    private _device: IDevice;
    private _ignoreDeviceController: boolean;
    private _wdaLocalPort: number;
    private _relaxedSecurity: boolean;
    private _cleanApp: boolean;
    private _attachToDebug: boolean;
    private _startSession: boolean;
    private _sessionId: string;
    private exceptions: Array<string> = new Array();

    constructor() {
        this._projectDir = parser.projectDir;
        this._projectBinary = parser.projectBinary;
        this._pluginRoot = parser.pluginRoot;
        this._pluginBinary = parser.pluginBinary;
        this._appPath = parser.appPath;
        this._port = parser.port;
        this._verbose = parser.verbose;
        this._appiumCapsLocation = parser.appiumCapsLocation;
        this._appiumCaps = resolveCapabilities(this._appiumCapsLocation, parser.runType, parser.projectDir);
        this._testFolder = parser.testFolder;
        this._storage = parser.storage;
        this._testReports = parser.testReports;
        this._reuseDevice = parser.reuseDevice;
        this._devMode = parser.devMode;
        this._runType = parser.runType;
        this._isAndroid = this.isAndroidPlatform();
        this._isIOS = !this._isAndroid;
        this._isSauceLab = parser.isSauceLab;
        this._ignoreDeviceController = parser.ignoreDeviceController;
        this._wdaLocalPort = parser.wdaLocalPort;
        this._path = parser.path;
        this._relaxedSecurity = parser.relaxedSecurity;
        this._cleanApp = parser.cleanApp;
        this._attachToDebug = parser.attachToDebug;
        this._sessionId = parser.sessionId;
        this._startSession = parser.startSession;
        this.setAutomationName();
        this.resolveApplication();
        this.checkMandatoryCapabiliies();
        this.throwExceptions();
        this.shouldSetFullResetOption();
    }

    get path() { return this._path; }
    get projectDir() { return this._projectDir; }
    get projectBinary() { return this._projectBinary; }
    get pluginRoot() { return this._pluginRoot; }
    get pluginBinary() { return this._pluginBinary; }
    get port() { return this._port; }
    get verbose() { return this._verbose; }
    get appiumCapsLocation() { return this._appiumCapsLocation; }
    get appiumCaps() { return this._appiumCaps; }
    get testFolder() { return this._testFolder; }
    get storage() { return this._storage; }
    get testReports() { return this._testReports; }
    get reuseDevice() { return this._reuseDevice; }
    get devMode() { return this._devMode; }
    get runType() { return this._runType; }
    get isAndroid() { return this._isAndroid; }
    get isIOS() { return this._isIOS; }
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

    private isAndroidPlatform() { return this._appiumCaps.platformName.toLowerCase().includes("android"); }

    private shouldSetFullResetOption(){
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
        if (this._isAndroid) {
            if (this.tryGetAndroidApiLevel() > 6 || (this.appiumCaps["apiLevel"] && this.appiumCaps["apiLevel"].toLowerCase().includes("p"))) {
                this._automationName = AutomationName.UiAutomator2;
            }
        }
    }

    if (this._automationName) {
        this.appiumCaps["automationName"] = this._automationName.toString();
        console.log(`Automation name set to: ${this.appiumCaps["automationName"]}`);
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
        this._appiumCaps.app = `sauce-storage:${this.appPath}`
        this._ignoreDeviceController = true;
        console.log("Using Sauce Labs. The application path is changed to: " + this.appPath);
    } else {
        this.appiumCaps.app = getAppPath(this);
        this._appPath = this._appiumCaps.app;
        console.log("Application full path: " + this._appiumCaps.app);
    }
}

    private checkMandatoryCapabiliies() {
    if (!this.isSauceLab && !fileExists(this._appiumCaps.app)) {
        this.exceptions.push("The application folder doesn't exist!");
    }

    if (!this._runType) {
        this.exceptions.push("Missing runType! Please select one from appium capabilities file!");
    }

    if (!this._appiumCaps.platformName) {
        this.exceptions.push("Platform name is missing! Please, check appium capabilities file!");
    }

    if (!this._appiumCaps.platformVersion) {
        console.warn("Platform version is missing! You'd better to set it in order to use the correct device");
    }

    if (!this._appiumCaps.deviceName && !this._appiumCaps.udid) {
        this.exceptions.push("The device name or udid are missing! Please, check appium capabilities file!");
    }
}

    private throwExceptions() {
    this.exceptions.forEach(msg => {
        logErr(msg, true);
    });

    if (this.exceptions.length > 0) {
        const messagesString = this.exceptions.length > 1 ? "messages" : "message";
        throw new Error(`See the ${messagesString} above and fullfill the conditions!!!`);
    }
}
}