import { startServer, stopServer } from "nativescript-dev-appium";

before("start server", async () => {
    console.log("Starting server ...");
    const port = 9191;
    await startServer(port);
    console.log("Server started!");
});

before("setup driver", async () => {
    console.log("Setting up driver");
});

after("kill driver", async () => {
    console.log("Kill driver");
});

after("stop server", async () => {
    await stopServer();
    console.log("Server stopped!");
});
