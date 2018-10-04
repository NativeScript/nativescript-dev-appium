/// <reference types="node" />
import * as childProcess from "child_process";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { Point } from "./point";
import { Direction } from "./direction";
import { IDeviceManager } from "./interfaces/device-manager";
export declare function resolve(mainPath: any, ...args: any[]): any;
export declare function fileExists(p: any): boolean;
export declare function isDirectory(fullName: any): boolean;
export declare function isFile(fullName: any): boolean;
export declare function copy(src: any, dest: any, verbose: any): any;
export declare function contains(source: any, check: any): boolean;
export declare function searchFiles(folder: any, words: any, recursive?: boolean, files?: any[]): Array<string>;
export declare function shutdown(processToKill: childProcess.ChildProcess, verbose: any): void;
export declare function killPid(pid: any, verbose: any): void;
export declare function waitForOutput(process: any, matcher: any, errorMatcher: any, timeout: any, verbose: any): Promise<boolean>;
export declare function executeCommand(args: any, cwd?: string): string;
export declare function isWin(): boolean;
export declare function getStorageByDeviceName(args: INsCapabilities): string;
export declare function getStorageByPlatform(args: INsCapabilities): string;
export declare const getStorage: (args: INsCapabilities) => string;
export declare function getReportPath(args: INsCapabilities): string;
export declare const getRegexResultsAsArray: (regex: any, str: any) => any[];
export declare function getAppPath(caps: INsCapabilities): any;
export declare function calculateOffset(direction: any, y: number, yOffset: number, x: number, xOffset: number, isIOS: boolean, verbose: any): {
    point: Point;
    duration: number;
};
/**
 * Scrolls from point to other point with minimum inertia
 * @param y
 * @param x
 * @param yOffset
 * @param xOffset
 */
export declare function scroll(wd: any, driver: any, direction: Direction, isIOS: boolean, y: number, x: number, yOffset: number, xOffset: number, verbose: any): Promise<void>;
export declare const addExt: (fileName: string, ext: string) => string;
export declare const isPortAvailable: (port: any) => Promise<{}>;
export declare const findFreePort: (retries?: number, port?: number) => Promise<number>;
export declare function wait(milisecodns: any): void;
export declare function getSessions(port: any, host?: string): Promise<{}>;
export declare const prepareDevice: (args: INsCapabilities, deviceManager: IDeviceManager) => Promise<INsCapabilities>;
export declare const prepareApp: (args: INsCapabilities) => Promise<INsCapabilities>;
export declare const sessionIds: (port: any) => Promise<any[]>;
export declare function encodeImageToBase64(path: any): string;
export declare function logInfo(info: any, obj?: any): void;
export declare function logWarn(info: any, obj?: any): void;
export declare function logError(info: any, obj?: any): void;
export declare function log(message: any, verbose: any): void;
export declare const logColorized: (bgColor: ConsoleColor, frontColor: ConsoleColor, info: any) => void;
declare enum ConsoleColor {
    Reset = "\u001B[0m",
    Bright = "\u001B[1m",
    Dim = "\u001B[2m",
    Underscore = "\u001B[4m",
    Blink = "\u001B[5m",
    Reverse = "\u001B[7m",
    Hidden = "\u001B[8m",
    FgBlack = "\u001B[30m",
    FgRed = "\u001B[31m",
    FgGreen = "\u001B[32m",
    FgYellow = "\u001B[33m",
    FgBlue = "\u001B[34m",
    FgMagenta = "\u001B[35m",
    FgCyan = "\u001B[36m",
    FgWhite = "\u001B[37m",
    BgBlack = "\u001B[40m",
    BgRed = "\u001B[41m",
    BgGreen = "\u001B[42m",
    BgYellow = "\u001B[43m",
    BgBlue = "\u001B[44m",
    BgMagenta = "\u001B[45m",
    BgCyan = "\u001B[46m",
    BgWhite = "\u001B[47m"
}
export {};
