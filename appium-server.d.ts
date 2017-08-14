export declare class AppiumServer {
    private _port;
    private _appium;
    private _server;
    constructor(_port: number);
    port: number;
    readonly server: any;
    start(): Promise<{}>;
    stop(): Promise<void> | Promise<{}>;
    private resolveAppiumDependency();
}
