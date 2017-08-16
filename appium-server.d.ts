export declare class AppiumServer {
    private _appium;
    private _server;
    private _port;
    private _runType;
    constructor();
    port: number;
    runType: string;
    readonly server: any;
    start(): Promise<{}>;
    stop(): Promise<void | {}>;
    private resolveAppiumDependency();
}
