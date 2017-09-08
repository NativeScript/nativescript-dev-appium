import { INsCapabilities } from "./ins-capabilities";
export declare class NsCapabilities implements INsCapabilities {
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
    private _appPath;
    constructor();
    readonly projectDir: any;
    readonly projectBinary: any;
    readonly pluginRoot: any;
    readonly pluginBinary: any;
    readonly port: any;
    readonly verbose: any;
    readonly appiumCapsLocation: any;
    readonly appiumCaps: any;
    readonly testFolder: any;
    readonly runType: any;
    readonly isSauceLab: any;
    appPath: string;
}
