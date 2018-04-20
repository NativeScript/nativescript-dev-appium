/// <reference types="node" />
import * as childProcess from "child_process";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { Point } from "./point";
import { Direction } from "./direction";
export declare function resolve(mainPath: any, ...args: any[]): any;
export declare function fileExists(p: any): boolean;
export declare function isDirectory(fullName: any): boolean;
export declare function isFile(fullName: any): boolean;
export declare function copy(src: any, dest: any, verbose: any): any;
export declare function contains(source: any, check: any): boolean;
export declare function searchFiles(folder: any, words: any, recursive?: boolean, files?: any[]): Array<string>;
export declare function log(message: any, verbose: any): void;
export declare function loglogOut(line: any, verbose: any): void;
export declare function logErr(line: any, verbose: any): void;
export declare function shutdown(processToKill: childProcess.ChildProcess, verbose: any): void;
export declare function killPid(pid: any, verbose: any): void;
export declare function waitForOutput(process: any, matcher: any, errorMatcher: any, timeout: any, verbose: any): Promise<boolean>;
export declare function executeCommand(args: any, cwd?: string): string;
export declare function isWin(): boolean;
export declare function getStorageByDeviceName(args: INsCapabilities): string;
export declare function getStorageByPlatform(args: INsCapabilities): string;
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
