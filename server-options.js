"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ServerOptions = (function () {
    function ServerOptions(_port) {
        this._port = _port;
    }
    Object.defineProperty(ServerOptions.prototype, "port", {
        get: function () {
            return this._port;
        },
        set: function (port) {
            this._port = port;
        },
        enumerable: true,
        configurable: true
    });
    return ServerOptions;
}());
exports.ServerOptions = ServerOptions;
//# sourceMappingURL=server-options.js.map