import * as path from "path";
import * as fs from "fs";
import * as childProcess from "child_process";
import * as glob from "glob";
import * as http from "http";

import { INsCapabilities } from "./interfaces/ns-capabilities";
import { AndroidController, IOSController } from "mobile-devices-controller";
import { Point } from "./point";
import { Direction } from "./direction";
import { IDeviceManager } from "./interfaces/device-manager";

export function resolve(mainPath, ...args) {
    if (!path.isAbsolute(mainPath)) {
        if (mainPath.startsWith('~')) {
            mainPath = path.join(process.env.HOME, mainPath.slice(1));
        } else {
            mainPath = path.resolve(mainPath);
        }
    }

    let fullPath = mainPath;
    args.forEach(p => {
        fullPath = path.resolve(fullPath, p);
    });
    return fullPath;
}

export function fileExists(p) {
    try {
        if (fs.existsSync(p)) {
            return true;
        }

        return false;
    } catch (e) {
        if (e.code == 'ENOENT') {
            logError("File does not exist. " + p, true);
            return false;
        }

        logError("Exception fs.statSync (" + path + "): " + e, true);
        throw e;
    }
}

export function isDirectory(fullName) {
    try {
        if (fileExists(fullName) && fs.statSync(fullName).isDirectory()) {
            return true;
        }
    } catch (e) {
        console.log(e.message);
        return false;
    }

    return false;
}

export function isFile(fullName) {
    try {
        if (fileExists(fullName) && fs.statSync(fullName).isFile()) {
            return true;
        }
    } catch (e) {
        logError(e.message, true);
        return false;
    }

    return false;
}

export function copy(src, dest, verbose) {
    if (!fileExists(src)) {
        return Error("Cannot copy: " + src + ". Source doesn't exist: " + dest);
    }
    if (fileExists(src) && isFile(src) && isDirectory(dest)) {
        dest = path.join(dest, path.basename(src));
    }

    if (isDirectory(src)) {
        if (!fileExists(dest)) {
            console.info("CREATE Directory: " + dest);
            fs.mkdirSync(dest);
        }
        const files = getAllFileNames(src);
        const destination = dest;
        files.forEach(file => {
            const destt = path.resolve(destination, file);
            copy(path.join(src, file), destt, verbose);
        });
    } else {
        fs.writeFileSync(dest, fs.readFileSync(src));
    }
    if (verbose) {
        console.info("File " + src + " is coppied to " + dest);
    }

    return dest;
}

function getAllFileNames(folder) {
    let files = new Array();
    fs.readdirSync(resolve(folder)).forEach(file => {
        files.push(file);
    });

    return files;
}

/// ^nativ\w*(.+).gz$ native*.gz
/// \w*nativ\w*(.+)\.gz$ is like *native*.gz
/// \w*nativ\w*(.+)\.gz\w*(.+)$ is like *native*.gz*
function createRegexPattern(text) {
    let finalRex = "";
    text.split(",").forEach(word => {
        word = word.trim();
        let searchRegex = word;
        if (word !== "" && word !== " ") {
            searchRegex = searchRegex.replace(".", "\\.");
            searchRegex = searchRegex.replace("*", "\\w*(.+)?");
            if (!word.startsWith("*")) {
                searchRegex = "^" + searchRegex;
            }
            if (!word.endsWith("*")) {
                searchRegex += "$";
            }
            if (!contains(finalRex, searchRegex)) {
                finalRex += searchRegex + "|";
            }
        }
    });
    finalRex = finalRex.substring(0, finalRex.length - 1);
    const regex = new RegExp(finalRex, "gi");
    return regex;
}

export function contains(source, check) {
    return source.indexOf(check) >= 0;
}

// Search for files and folders. If should not match, than the filter will skip this words. Could be use with wildcards
export function searchFiles(folder, words, recursive: boolean = true, files = new Array()): Array<string> {
    const rootFiles = getAllFileNames(folder);
    const regex = createRegexPattern(words);
    rootFiles.filter(f => {
        const fileFullName = resolve(folder, f);
        let m = regex.test(f);
        if (m) {
            files.push(fileFullName);
        } else if (isDirectory(fileFullName) && recursive) {
            searchFiles(fileFullName, words, recursive, files);
        }
    });

    return files;
}

export function shutdown(processToKill: childProcess.ChildProcess, verbose) {
    try {
        if (processToKill && processToKill !== null) {
            if (isWin()) {
                killPid(processToKill.pid, verbose);
            } else {
                processToKill.kill();
            }
            processToKill.killed = true;
            processToKill = null;
            console.log("Shut down!!!");
        }
    } catch (error) {
        logError(error, verbose);
    }
}

export function killPid(pid, verbose) {
    let output = childProcess.execSync('taskkill /PID ' + pid + ' /T /F');
    log(output, verbose);
}

export function waitForOutput(process, matcher, errorMatcher, timeout, verbose) {
    return new Promise<boolean>(function (resolve, reject) {
        const abortWatch = setTimeout(function () {
            process.kill();
            logError("Timeout expired, output not detected for: " + matcher);
            resolve(false);
        }, timeout);

        process.stdout.on("data", function (data) {
            let line = "" + data;
            log(line, verbose);
            if (errorMatcher.test(line)) {
                clearTimeout(abortWatch);
                resolve(false);
            }

            if (matcher.test(line)) {
                clearTimeout(abortWatch);
                resolve(true);
            }
        });
    });
}

export function executeCommand(args, cwd = process.cwd()): string {
    const commands = args.split(" ");
    const baseCommand = commands.shift();
    const output = childProcess.spawnSync(baseCommand, commands, {
        shell: true,
        cwd: cwd,
        encoding: "UTF8"
    });

    return output.output[1].toString();
}

export function isWin() {
    return /^win/.test(process.platform);
}

const getDeviceName = (args) => {
    const deviceName = (args.attachToDebug || args.sessionId) ? args.device.name : args.appiumCaps.deviceName;
    return deviceName;
}

export function getStorageByDeviceName(args: INsCapabilities) {
    let storage = getStorage(args);
    if (args.imagesPath) {
        const segments = args.imagesPath.split(/[\/\\]+/);
        storage = path.join(storage, segments.join(path.sep));
        return storage;
    }
    const appName = resolveSauceLabAppName(getAppName(args));
    storage = createStorageFolder(storage, appName);
    storage = createStorageFolder(storage, getDeviceName(args));

    return storage;
}

export function getStorageByPlatform(args: INsCapabilities) {
    let storage = getStorage(args);
    const appName = resolveSauceLabAppName(getAppName(args));
    storage = createStorageFolder(storage, appName);
    storage = createStorageFolder(storage, args.appiumCaps.platformName.toLowerCase());

    return storage;
}

const checkStorageIsUndefined = (storage) => { return !storage || storage === 'undefined' || storage === null || storage === 'null'; }

export const getStorage = (args: INsCapabilities) => {
    let storage = args.storage;
    if (checkStorageIsUndefined(storage)) {
        storage = createStorageFolder(resolve(args.projectDir, args.testFolder), "resources");
        storage = createStorageFolder(storage, "images");
    }

    return storage;
}

export function getReportPath(args: INsCapabilities) {
    let report = args.testReports;
    if (!report) {
        report = createStorageFolder(resolve(args.projectDir, args.testFolder), "reports");
    }
    const appName = getAppName(args);
    report = createStorageFolder(report, appName);
    report = createStorageFolder(report, getDeviceName(args));

    return report;
}

export const getRegexResultsAsArray = (regex, str) => {
    let m;
    const result = [];
    while ((m = regex.exec(str)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        m.forEach(element => {
            if (result.indexOf(element) < 0) {
                result.push(element);
            }
        });
    }

    return result;
}

function getAppName(args: INsCapabilities) {
    const appName = args.appName || path.basename(args.appPath)
        .replace(path.extname(args.appPath), "")
        .replace("-release", "").replace("-debug", "");

    return appName;
}

export function getAppPath(caps: INsCapabilities) {
    let basePath = caps.appiumCaps.app || caps.appPath;
    if (fs.existsSync(basePath) && ((basePath.endsWith(".apk") || basePath.endsWith(".app") || basePath.endsWith(".ipa")))) {
        return resolve(basePath);
    }

    // try to resolve app automatically
    if (!fs.existsSync(basePath)) {
        if (caps.isAndroid) {
            const androidPlatformsPath = 'platforms/android';
            //platforms/android/build/outputs/apk/
            //platforms/android/app/build/outputs/apk
            //platforms/android/app/build/outputs/apk
            //   /release
            //   /debug

            basePath = `${androidPlatformsPath}/app/build/outputs/apk/**/*.apk`;
            if (!fs.existsSync(`${androidPlatformsPath}/app/build/outputs/apk`)) {
                basePath = `${androidPlatformsPath}/build/outputs/apk/**/*.apk`;
            }
        } else {
            const iosPlatformsPath = 'platforms/ios/build';
            basePath = caps.runType.includes("device") ? `${iosPlatformsPath}/device/**/*.ipa` : `${iosPlatformsPath}/emulator/**/*.app`;
        }
    }

    let apps = glob.sync(basePath);

    if (!apps || apps.length === 0) {
        apps = glob.sync(`${caps.projectDir}`)
            .filter(function (file) {
                return file.endsWith(".ipa") || file.endsWith(".app") || file.endsWith(".apk")
            });
    }

    if (!apps || apps.length === 0) {
        logError(`No 'app' capability provided or the convension for 'runType'${caps.runType} is not as excpeced! 
                In order to automatically search and locate app package please use 'device' in your 'runType' name. E.g --runType device.iPhone7.iOS110, --runType sim.iPhone7.iOS110 or
                specify correct app path`);
    }

    logInfo(`Available applications:`, apps);
    logInfo(`Pick first application: `, apps[0]);
    const appFullPath = apps.length > 0 ? resolve(apps[0]) : undefined;
    return appFullPath;
}

export function calculateOffset(direction, y: number, yOffset: number, x: number, xOffset: number, isIOS: boolean, verbose) {
    let speed = 10;
    let yEnd = Math.abs(yOffset);
    let xEnd = Math.abs(xOffset);
    let duration = Math.abs(yEnd) * speed;

    if (isIOS) {
        speed = 100;
        if (direction === Direction.down) {
            direction = -1;
            yEnd = direction * yEnd;
        }
        if (direction === Direction.right) {
            direction = -1;
            xEnd = direction * xEnd;
        }
    } else {
        if (direction === Direction.down) {
            yEnd = Math.abs(yOffset - y);
        }
        if (direction === Direction.up) {
            yEnd = direction * Math.abs((Math.abs(yOffset) + y));
        }

        duration = Math.abs(yOffset) * speed;

        if (direction === Direction.right) {
            xEnd = Math.abs(xOffset - x);
        }

        if (direction === Direction.left) {
            xEnd = Math.abs(xOffset + x);
        }

        if (yOffset < xOffset && x) {
            duration = Math.abs(xOffset) * speed;
        }

    }
    log({ point: new Point(xEnd, yEnd), duration: duration }, verbose);

    return { point: new Point(xEnd, yEnd), duration: duration };
}

/**
 * Scrolls from point to other point with minimum inertia
 * @param y 
 * @param x 
 * @param yOffset
 * @param xOffset 
 */
export async function scroll(wd, driver, direction: Direction, isIOS: boolean, y: number, x: number, yOffset: number, xOffset: number, verbose) {
    if (x === 0) {
        x = 20;
    }
    if (y === 0) {
        y = 20;
    }
    const endPoint = calculateOffset(direction, y, yOffset, x, xOffset, isIOS, verbose);
    const action = new wd.TouchAction(driver);
    action
        .press({ x: x, y: y })
        .wait(endPoint.duration)
        .moveTo({ x: endPoint.point.x, y: endPoint.point.y })
        .release();
    await action.perform();
    await driver.sleep(150);
}

function createStorageFolder(storage, directory) {
    storage = resolve(storage, directory);
    if (!fileExists(storage)) {
        fs.mkdirSync(storage);
    }

    return storage;
}

export const addExt = (fileName: string, ext: string) => { return fileName.endsWith(ext) ? fileName : fileName.concat(ext); }

export const isPortAvailable = (port) => {
    const net = require('net');
    return new Promise(resolve => {
        if (isNaN(port) || port != parseInt(port) || port < 0 || port > 65536) {
            // const err = 'Ivalid input. Port must be an Integer number betwen 0 and 65536';
            // console.error(err);
            resolve(false);
        }
        port = parseInt(port);
        const tester = net.createServer()
            .once('error', err => {
                //console.error("Error: ", err);
                resolve(false);
            })
            .once('listening', () => tester.once('close', () => resolve(true)).close())
            .listen(port);
    });
};

export const findFreePort = async (retries: number = 10, port: number = 3000) => {
    let p: number = port;

    while (!(await isPortAvailable(p)) && retries > 0) {
        p += 10;
        retries--;
    }

    return p;
}

export function wait(milisecodns) {
    const startTime = Date.now();
    while (Date.now() - startTime <= milisecodns) {
    }

    return;
}

function resolveSauceLabAppName(appName: string) {
    return appName.includes("sauce-storage:") ? appName.replace("sauce-storage:", "") : appName;
}

export function getSessions(port, host = `0.0.0.0`) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:${port}/wd/hub/sessions`, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                let result = undefined;
                console.log(data);

                try {
                    //result = JSON.parse(data);
                    result = data;
                } catch (error) {

                }

                resolve(result);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            resolve(undefined);
        });
    });
}

export const prepareDevice = async (args: INsCapabilities, deviceManager: IDeviceManager) => {
    if (!args.device) {
        const device = await deviceManager.startDevice(args);
        args.device = device;
    }

    return args;
}

export const prepareApp = async (args: INsCapabilities) => {
    const appPackage = args.isAndroid ? "appPackage" : "bundleId";
    const appFullPath = args.appiumCaps.app;

    if (!args.ignoreDeviceController && !args.attachToDebug && !args.sessionId) {
        if (appFullPath && !args.appiumCaps[appPackage]) {
            console.log(`Trying to resolve automatically ${appPackage}!`);
            args.appiumCaps[appPackage] = args.deviceManager.getPackageId(args.device, appFullPath);
            console.log(`Setting capabilities ${args.runType}{ "${appPackage}" : "${args.appiumCaps[appPackage]}" }!`);
        }

        const appActivityProp = "appActivity";
        if (args.isAndroid && appFullPath && !args.appiumCaps[appActivityProp]) {
            console.log(`Trying to resolve automatically ${appActivityProp}!`);
            args.appiumCaps[appActivityProp] = AndroidController.getLaunchableActivity(appFullPath);
            console.log(`Setting capabilities ${args.runType}{ "${appActivityProp} : "${args.appiumCaps[appActivityProp]}" }!`);
        }

        if (!args.appiumCaps[appPackage]) {
            logError(`Please, provide ${appPackage} in ${args.appiumCapsLocation} file!`);
            process.exit(1);
        }

        if (args.isAndroid && !args.appiumCaps[appActivityProp]) {
            logError(`Please, provide ${appActivityProp} in ${args.appiumCapsLocation} file!`);
            process.exit(1);
        }

        const groupings = getRegexResultsAsArray(/(\w+)/gi, args.appiumCaps[appPackage]);
        args.appName = groupings[groupings.length - 1];
        console.log(`Setting application name as ${args.appName}`);
        if (!args.devMode && !args.ignoreDeviceController) {
            logInfo("Check and uninstall application from device.");
            await args.deviceManager.uninstallApp(args);
        } else {
            args.appiumCaps.app = "";
        }
    }

    if (!args.ignoreDeviceController
        && !args.attachToDebug
        && !args.sessionId
        && !args.appiumCaps[appPackage]
        && args.isIOS
        && args.appiumCaps.app) {
        IOSController.getIOSPackageId(undefined, args.appiumCaps.app);
    }

    if (args.appiumCaps[appPackage]) {
        const groupings = getRegexResultsAsArray(/(\w+)/gi, args.appiumCaps[appPackage]);
        args.appName = groupings[groupings.length - 1];
    }

    return args;
}

export const sessionIds = async (port) => {
    const sesssions = JSON.parse(((await getSessions(port)) || "{}") + '');
    const ids = [];
    sesssions.value.forEach(value => {
        ids.push(value.id);
    });
    return ids;
}

export function encodeImageToBase64(path) {
    const bitmap = fs.readFileSync(path);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

export function logInfo(info, obj = undefined) {
    if (obj) {
        info += " " + JSON.stringify(obj);
    }
    console.log(`${ConsoleColor.FgCyan}%s${ConsoleColor.Reset}`, info);
}

export function logWarn(info, obj = undefined) {
    if (obj) {
        info += " " + JSON.stringify(obj);
    }
    console.log(`${ConsoleColor.BgYellow}${ConsoleColor.FgBlack}%s${ConsoleColor.Reset}`, info);
}

export function logError(info, obj = undefined) {
    if (obj) {
        info += " " + JSON.stringify(obj);
    }
    console.log(`${ConsoleColor.BgRed}%s${ConsoleColor.Reset}`, info);
}

export function log(message, verbose) {
    if (verbose) {
        console.log(message);
    }
}

export const logColorized = (bgColor: ConsoleColor, frontColor: ConsoleColor, info) => {
    console.log(`${ConsoleColor.BgYellow}${ConsoleColor.FgBlack}%s${ConsoleColor.Reset}`, info);
}

enum ConsoleColor {
    Reset = "\x1b[0m",
    Bright = "\x1b[1m",
    Dim = "\x1b[2m",
    Underscore = "\x1b[4m",
    Blink = "\x1b[5m",
    Reverse = "\x1b[7m",
    Hidden = "\x1b[8m",

    FgBlack = "\x1b[30m",
    FgRed = "\x1b[31m",
    FgGreen = "\x1b[32m",
    FgYellow = "\x1b[33m",
    FgBlue = "\x1b[34m",
    FgMagenta = "\x1b[35m",
    FgCyan = "\x1b[36m",
    FgWhite = "\x1b[37m",

    BgBlack = "\x1b[40m",
    BgRed = "\x1b[41m",
    BgGreen = "\x1b[42m",
    BgYellow = "\x1b[43m",
    BgBlue = "\x1b[44m",
    BgMagenta = "\x1b[45m",
    BgCyan = "\x1b[46m",
    BgWhite = "\x1b[47m"
}