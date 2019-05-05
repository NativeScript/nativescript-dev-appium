

import { isWin, isMac, isLinux } from "../utils";
import { execSync } from "child_process";

export const screencapture = (imageFullName: string) => {
    let command = "", result = "";

    if (isWin()) {
        command = "";
    } else if (isMac()) {
        command = `screencapture -x -f '${imageFullName}'`;
    } else if (isLinux()) {
        command = `gnome-screenshot -f '${imageFullName}'`;
    } else {
        console.log("We could not capture the screen. Not supported OS!");
    }

    if (command) {
        try {
            execSync(command) + "";
            result = imageFullName;
        } catch (error) {
            result = "We could not capture the screen!";
        }
    } else {
        result = "No file name provided to catch the screen!";
    }

    return result;
}