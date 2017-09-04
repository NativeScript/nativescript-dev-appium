export interface INsCapabilities {
    projectDir: string;
    projectBinary: string;
    pluginRoot: string;
    pluginBinary: string;
    appRootPath: string;
    port: number;
    verbose: boolean;
    appiumCapsLocation: string;
    appiumCaps: any;
    testFolder: string;
    runType: string;
    isSauceLab: boolean;  
}