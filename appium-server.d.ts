export declare class AppiumServer {
    private _appium;
    private _server;
    private _port;
    constructor();
    port: number;
    readonly server: any;
    start(): Promise<any>;
    stop(): Promise<void>;
    private resolveAppiumDependency();
}
