

import { isWin, isMac, isLinux } from "../utils";
import { execSync } from "child_process";

export const screencapture = (imageFullName: string) => {
    let command ="";
    let result;
    if (isWin()) {
        command = "";
    }

    if (isMac()) {
        command = `screencapture -x -f '${imageFullName}'`;
    }

    if (isLinux()) {
        command = `gnome-screenshot -f '${imageFullName}'`;
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