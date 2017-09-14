import * as parser from "./parser"
import { INsCapabilities } from "./ins-capabilities";
import { resolveCapabilities } from "./capabilities-helper";

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
    private _runType;
    private _isSauceLab;
    private _appPath: string;
    private _emulatorOptions: string;

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
        this._runType = parser.runType;
        this._isSauceLab = parser.isSauceLab;
        this._appiumCaps = resolveCapabilities(this._appiumCapsLocation, parser.runType, parser.projectDir);
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
    get runType() { return this._runType; }
    get isSauceLab() { return this._isSauceLab; }
    get appPath() { return this._appPath; }
    set appPath(appPath: string) { this._appPath = appPath; }
    get emulatorOptions() { return (this._emulatorOptions || "-wipe-data -gpu on") }
}