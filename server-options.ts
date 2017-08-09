export class ServerOptions {
    constructor(private _port: number) {

    }

    get port() {
        return this._port;
    }

    set port(port: number) {
        this._port = port;
    }
}