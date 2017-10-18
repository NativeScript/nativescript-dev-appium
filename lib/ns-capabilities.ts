import * as parser from "./parser"
import { INsCapabilities } from "./ins-capabilities";
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
    private _runType;
    private _isSauceLab;
    private _appPath: string;
    private _emulatorOptions: string;
    private _device: IDevice;
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
        this._testFolder = parser.testFolder;
        this._storage = parser.storage;
        this._testReports = parser.testReports;
        this._reuseDevice = parser.reuseDevice;
        this._runType = parser.runType;
        this._isSauceLab = parser.isSauceLab;
        this._appiumCaps = resolveCapabilities(this._appiumCapsLocation, parser.runType, parser.projectDir);
        this.resolveAppPath();
        this.checkMandatoryCapabiliies();
        this.throwExceptions();
    }

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
    get runType() { return this._runType; }
    get isSauceLab() { return this._isSauceLab; }
    get appPath() { return this._appPath; }
    set appPath(appPath: string) { this._appPath = appPath; }
    get device() { return this._device; }
    set device(device: IDevice) { this._device = device; }
    get emulatorOptions() { return (this._emulatorOptions || "-wipe-data -gpu on") }

    private resolveAppPath() {

        if (this._appPath) {
            this._appiumCaps.app = this._appPath;
        }

        if (!this._appiumCaps.app) {
            this._appiumCaps.app = getAppPath(this._appiumCaps.platformName.toLowerCase(), this._runType.toLowerCase());
        }
        console.log("Application full path: " + this._appiumCaps.app);
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

        if (!this._appiumCaps.platformName) {
            this.exceptions.push("Platform version is missing! Please, check appium capabilities file!");
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