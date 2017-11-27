
import * as http from "http";

export class ServiceContext {
    private readonly _apiVersion = "/api/v1/";
    private readonly _deviceController = `${this._apiVersion}/devices`

    constructor(private _baseUrl = "localhost", private _port = 8000) {
    }

    public async subscribe(deviceName, platformName, platformVersion, info) {
        return await this.getJSON(`${this._deviceController}/subscribe?name=${encodeURIComponent(deviceName)}&platform=${encodeURIComponent(platformName)}&apiLevel=${encodeURIComponent(platformVersion)}&info=${encodeURIComponent(info)}`);
    }

    public async unsubscribe(token) {
        return await this.getJSON(`${this._deviceController}/unsubscribe?token=${token}`);
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