import { INsCapabilities } from "./interfaces/ns-capabilities";
import { INsCapabilitiesArgs } from "./interfaces/ns-capabilities-args";
import { AutomationName } from "./automation-name";
import { resolveCapabilities } from "./capabilities-helper";
import { getAppPath, logInfo, logError, logWarn, getStorageByDeviceName, getStorageByPlatform, getReportPath } from "./utils";
import { IDevice, Platform, Status, DeviceType } from "mobile-devices-controller";
import { IDeviceManager } from "./interfaces/device-manager";
import { existsSync, mkdirSync } from "fs";
import { DeviceManager } from "./device-manager";
import { ITestReporter } from "./interfaces/test-reporter";
import { sep, basename } from "path";
import { LogImageType } from "./enums/log-image-type";

export class NsCapabilities implements INsCapabilities {
    private _automationName: AutomationName;
    private _testReporter: ITestReporter = <ITestReporter>{};
    private _storageByDeviceName: string;
    private _storageByPlatform: string;
    private _reportsPath: string;

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
    public kobiton: boolean;
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
    public deviceTypeOrPlatform: string;
    public driverConfig: any;
    public logImageTypes: Array<LogImageType>;
    public derivedDataPath: string;

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
        this.kobiton = this._parser.kobiton;
        this.ignoreDeviceController = this._parser.ignoreDeviceController;
        this.wdaLocalPort = this._parser.wdaLocalPort;
        this.derivedDataPath = this._parser.derivedDataPath;
        this.path = this._parser.path;
        this.capabilitiesName = this._parser.capabilitiesName;
        this.imagesPath = this._parser.imagesPath;
        this.appiumCaps = this._parser.appiumCaps;
        this.deviceTypeOrPlatform = this._parser.deviceTypeOrPlatform;
        this.device = this._parser.device;
        this.driverConfig = this._parser.driverConfig;
        this.logImageTypes = this._parser.logImageTypes;
    }

    get isAndroid() { return this.isAndroidPlatform(); }
    get isIOS() { return !this.isAndroid; }
    get automationName() { return this._automationName; }
    set automationName(automationName: AutomationName) {
        this._automationName = automationName;
    }

    setAutomationNameFromString(automationName: String) {
        const key = Object.keys(AutomationName).filter((v, i, a) => v.toLowerCase() === automationName.toLowerCase());
        this.automationName = AutomationName[key[0]];
    }

    /**
     * Set testReporter
     * @experimental
     */
    public get testReporter() {
        return this._testReporter;
    }

    /**
     * Set testReporter name like mochawesome
     * Set testReporter context usually this
     * Set testReporter log method like addContext in mochawesome
     * @experimental
     */
    public set testReporter(testReporter: ITestReporter) {
        this._testReporter = testReporter;
        if (this.logImageTypes && this.logImageTypes.length > 0) {
            this._testReporter.logImageTypes = this.logImageTypes;
        }
    }

    get storageByDeviceName() {
        if (!this._storageByDeviceName) {
            this._storageByDeviceName = getStorageByDeviceName(this);
        }
        return this._storageByDeviceName;
    }

    set storageByDeviceName(storageFullPath: string) {
        this._storageByDeviceName = storageFullPath;
    }

    get storageByPlatform() {
        if (!this._storageByPlatform) {
            this._storageByPlatform = getStorageByPlatform(this);
        }
        return this._storageByPlatform;
    }

    set storageByPlatform(storageFullPath: string) {
        this._storageByPlatform = storageFullPath;
    }

    get reportsPath() {
        if (!this._reportsPath) {
            this._reportsPath = getReportPath(this);
        }
        return this._reportsPath;
    }

    private _imagesReportDir: string;
    /**
     * @param text to log in test report
     */
    public testReporterLog(text: any) {
        if (this._testReporter && this._testReporter.name === "mochawesome") {
            if (/\.\w{3,3}$/ig.test(text) && this._testReporter.reportDir) {
                if (!this._imagesReportDir) {
                    if (!existsSync(this._testReporter.reportDir)) {
                        mkdirSync(this._testReporter.reportDir);
                    }

                    const reportDir = this._testReporter.reportDir.replace(/^\.\//, "")
                    const reportDirs = reportDir.split("/");
                    const reportDirsSeparated = reportDirs.slice(1, reportDirs.length);
                    this._imagesReportDir = reportDirsSeparated.length > 0 ? reportDirsSeparated.join(sep) : `.`;
                }

                const imagesPath = `${this._imagesReportDir}${sep}${basename(text)}`.replace(/\/{2,9}/ig, "/");
                this._testReporter.log(this._testReporter.context, imagesPath);
                return imagesPath;
            } else {
                this._testReporter.log(this._testReporter.context, text);
                return text;
            }
        }

        return undefined;
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

    public async validateArgs() {
        if (this.attachToDebug || this.sessionId) {
            this.isValidated = true;
        }

        if (!this.driverConfig) {
            this.driverConfig = {};
            this.driverConfig.host = "localhost";
            this.driverConfig.port = this.port;
        }

        if (this.deviceTypeOrPlatform || this.device) {
            let searchQuery = <IDevice>{};
            if (this.deviceTypeOrPlatform) {
                if (this.deviceTypeOrPlatform === Platform.ANDROID || this.deviceTypeOrPlatform === Platform.IOS) {
                    searchQuery.platform = this.deviceTypeOrPlatform
                } else {
                    searchQuery.type = this.deviceTypeOrPlatform as DeviceType;
                }
            } else {
                Object.assign(searchQuery, this.device);
            }

            searchQuery.status = Status.BOOTED;

            const runningDevices = await DeviceManager.getDevices(searchQuery);

            if (runningDevices && runningDevices.length > 0) {
                this.appiumCaps = this.appiumCaps || {};
                const d = runningDevices[0];

                const mandatoryAppiumCaps = {
                    "platformName": d.platform,
                    "noReset": true,
                    "fullReset": false,
                    "app": ""
                }

                Object.getOwnPropertyNames(mandatoryAppiumCaps).forEach(prop => {
                    if (!this.appiumCaps[prop]) {
                        this.appiumCaps[prop] = mandatoryAppiumCaps[prop];
                    }
                });

                this.appiumCaps.deviceName = d.name;
                this.appiumCaps.platformVersion = d.apiLevel;
                this.appiumCaps.udid = d.token;

                this.appiumCaps["newCommandTimeout"] = 999999;

                if (this.deviceTypeOrPlatform === "android") {
                    this.appiumCaps["lt"] = 60000;
                    this.appiumCaps["adbExecTimeout"] = 20000;
                } else {
                    this.appiumCaps["wdaConnectionTimeout"] = 999999;
                }

                this.device = d;
                logInfo("Using device: ", d);
                logInfo("appiumCaps: ", this.appiumCaps);
            } else {
                logError(`There is no running device of type:${this.deviceTypeOrPlatform}`);
                logInfo(`Use tns run ios/ android to install app on device!`)
            }

            this.devMode = true;
        }
        if (!this.attachToDebug && !this.sessionId) {
            this.appiumCaps = this.appiumCaps || resolveCapabilities(this.appiumCapsLocation || process.cwd(), this.runType, this.projectDir, this.capabilitiesName || "appium.capabilities.json");

            this.setAutomationName();
            this.resolveApplication();
            this.checkMandatoryCapabilities();
            this.throwExceptions();
            this.setResetOption();

            this.isValidated = true;
        } else {
            this.isValidated = false;
        }
    }

    private isAndroidPlatform() {
        return this.appiumCaps && this.appiumCaps ? this.appiumCaps.platformName.toLowerCase().includes("android") : undefined;
    }

    public setResetOption() {
        if (this.attachToDebug || this.devMode) {
            this.appiumCaps["fullReset"] = false;
            this.appiumCaps["noReset"] = true;
            logInfo("Changing appium setting fullReset: false and noReset: true ");
        }

        if ((!this.isSauceLab || !this.kobiton) && this.appiumCaps["fullReset"] === false && this.appiumCaps["noReset"] === true) {
            this.devMode = true;
            logWarn("Running in devMode!");
            logWarn("If the application is not installed on device, you can use 'tns run android/ ios' to install it!");
        }

        if (!this.ignoreDeviceController) {
            this.reuseDevice = !this.appiumCaps["fullReset"];
            this.appiumCaps["fullReset"] = false;
            if (!this.reuseDevice) {
                logWarn("The started device will be killed after the session quits!");
                logInfo("To avoid it, set 'fullReset: false' in appium capabilities.");
            }

            this.cleanApp = !this.appiumCaps["noReset"];
        }
    }

    public tryGetApiLevel() {
        try {
            const apiLevel = this.appiumCaps["platformVersion"] || this.appiumCaps["apiLevel"];
            if (this.isAndroid && apiLevel) {
                return +apiLevel.split(".").splice(0, 2).join('.');
            }
            return +apiLevel;
        } catch (error) { }

        return undefined;
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
                case AutomationName.UiAutomator1.toString().toLowerCase():
                    this.automationName = AutomationName.UiAutomator1; break;
            }
        } else {
            const apiLevel = +this.tryGetApiLevel();
            if (this.isAndroid) {
                if ((apiLevel >= 6 && apiLevel <= 17)
                    || apiLevel >= 23) {
                    this.automationName = AutomationName.UiAutomator2;
                } else {
                    this.automationName = AutomationName.UiAutomator1;
                }
            }

            if (this.isIOS) {
                if (apiLevel < 10) {
                    logWarn("Provide automationName")
                } else {
                    this.automationName = AutomationName.XCUITest;
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
        } else if (this.kobiton) {
            this.appPath = this.appiumCaps.app;
            this.ignoreDeviceController = true;
            logInfo(`Using Kobiton. The application path is changed to: ${this.appiumCaps.app}`);
        } else {
            this.appiumCaps.app = getAppPath(this);
            this.appPath = this.appiumCaps.app;

            logInfo(`Application full path: ${this.appiumCaps.app}`);
        }
    }

    private checkMandatoryCapabilities() {
        const appPackage = this.isAndroid ? "appPackage" : "bundleId";

        if ((!this.isSauceLab || !this.kobiton) && (!this.appiumCaps[appPackage] && !existsSync(this.appiumCaps.app))) {
            this.exceptions.push(`The application folder doesn't exists or no ${appPackage} provided!`);
        }

        if (!this.runType && !this.appiumCaps) {
            this.exceptions.push("Missing runType or device type! Please select one from appium capabilities file!");
        }

        if (!this.appiumCaps) {
            this.exceptions.push("Missing appium capabilities!");
        }

        if (!this.appiumCaps.platformName) {
            logWarn("Platform name is missing! Please, check appium capabilities file!");
        }

        if (!this.appiumCaps.platformVersion) {
            logWarn("Platform version is missing! It would be better to set it in order to use the correct device!");
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