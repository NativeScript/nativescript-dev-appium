
import * as http from "http";

export class ServiceContext {
    private readonly _apiVersion = "/api/v1/";
    private readonly _deviceController = `${this._apiVersion}/devices`
    private readonly _utilsController = `${this._apiVersion}/utils`
    private static serviceContext: ServiceContext;

    constructor(private _port, private _baseUrl) {
    }

    public static createServer(port = 8700, host = "localhost") {
        if (!ServiceContext.serviceContext) {
            ServiceContext.serviceContext = new ServiceContext(port, host);
        }

        return ServiceContext.serviceContext;
    }

    public async subscribe(deviceName, platformName, platformVersion, info) {
        return await this.getJSON(`${this._deviceController}/subscribe?name=${encodeURIComponent(deviceName)}&platform=${encodeURIComponent(platformName)}&apiLevel=${encodeURIComponent(platformVersion)}&info=${encodeURIComponent(info)}`);
    }

    public async unsubscribe(token) {
        return await this.getJSON(`${this._deviceController}/unsubscribe?token=${token}`);
    }

    public async releasePort(port) {
        return await this.getJSON(`${this._utilsController}/release-port?port=${port}`);
    }

    public async getFreePort(retriesCount = 30, from = 8300): Promise<string> {
        return await this.getJSON(`${this._utilsController}/free-port?retriesCount=${retriesCount}&from=${from}`) + "";
    }

    public getJSON(query) {
        return new Promise((resolve, reject) => {
            http.get(
                {
                    host: this._baseUrl,
                    port: this._port,
                    path: query,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }, (resp) => {
                    let data = '';
                    resp.on('data', (chunk) => {
                        console.log(data);
                        data += chunk;
                    });

                    resp.on('end', () => {
                        resolve(JSON.parse(data));
                    });

                }).on("error", (err) => {
                    console.log("", err);
                    reject("Error: " + err.message);
                });
        });
    }
}