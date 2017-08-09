export class ServerOptions {
    constructor(private _port: number) {

    }

    get port() {
        console.log("PORT",this._port)
        return this._port;
    }

    set port(port: number) {
        this._port = port;
    }
}