before("setup server", () => {
    console.log("Setting up server");
});
before("setup driver", () => {
    console.log("Setting up driver");
});
after("kill driver", () => {
    console.log("Kill driver");
});
after("kill server", () => {
    console.log("Kill server");
});