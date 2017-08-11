import * as child_process from "child_process";
import * as utils from "./utils";

let server;

export function startAppiumServer(port) {
    server = child_process.spawn("appium", ["-p", port], {
        shell: true,
        detached: false
    });
    return utils.waitForOutput(server, /listener started/, 60000);
}

export function stopAppiumServer(port) {
    // todo: check if allready dead?
    var isAlive = true;
    if (isAlive) {
        return new Promise((resolve, reject) => {
            server.on("close", (code, signal) => {
                console.log(`Appium terminated due ${signal}`);
                resolve();
            });
            // TODO: What about "error".
            server.kill('SIGINT');
            server = null;
        });
    } else {
        return Promise.resolve();
    }
}
