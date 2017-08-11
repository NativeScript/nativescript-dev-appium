export declare class AppiumServer {
    private _port;
    private _appium;
    private _server;
    constructor(_port: number);
    port: number;
    readonly server: any;
    start(): void;
    stop(): void;
    private resolveAppiumDependency();
}
export declare function startAppiumServer(port: any): Promise<{}>;
export declare function stopAppiumServer(port: any): Promise<void> | Promise<{}>;
