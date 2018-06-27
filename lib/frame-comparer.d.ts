import { INsCapabilities } from "./interfaces/ns-capabilities";
export declare function loadFrameComparer(nsCapabilities: INsCapabilities): FrameComparer;
export declare class FrameComparer {
    private _nsCapabilities;
    private _storage;
    private _logPath;
    private _framesGeneralName;
    private _cropImageRect;
    constructor(_nsCapabilities: INsCapabilities, _storage: string, _logPath: string);
    processVideo(videoFullName: any, framesGeneralName?: string, videoTempStorage?: string): Promise<any>;
    compareFrameRanges(frames: Array<string>, imageFrameCount: number, startRange: any, endRange: any, logImageComparisonResults?: boolean, tollerancePixels?: number, verbose?: boolean): Promise<boolean>;
    compareFrames(frames: Array<string>, imageFrameCount: number, tolleranceRange?: number, tollerancePixels?: number, logImageComparisonResults?: boolean, verbose?: boolean): Promise<boolean>;
}
