export declare class ServiceContext {
    private _port;
    private _baseUrl;
    private readonly _apiVersion;
    private readonly _deviceController;
    private readonly _utilsController;
    private static serviceContext;
    constructor(_port: any, _baseUrl: any);
    static createServer(port?: number, host?: string): ServiceContext;
    subscribe(deviceName: any, platformName: any, platformVersion: any, info: any): Promise<{}>;
    unsubscribe(token: any): Promise<{}>;
    releasePort(port: any): Promise<{}>;
    getFreePort(retriesCount?: number, from?: number): Promise<string>;
    getJSON(query: any): Promise<{}>;
}
