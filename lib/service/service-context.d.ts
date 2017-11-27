export declare class ServiceContext {
    private _baseUrl;
    private _port;
    private readonly _apiVersion;
    private readonly _deviceController;
    constructor(_baseUrl?: string, _port?: number);
    subscribe(deviceName: any, platformName: any, platformVersion: any, info: any): Promise<{}>;
    unsubscribe(token: any): Promise<{}>;
    getJSON(query: any): Promise<{}>;
}
