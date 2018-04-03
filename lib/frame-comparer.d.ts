import { INsCapabilities } from "./interfaces/ns-capabilities";
import * as frComparer from "frame-comparer";
export declare function loadFrameComparer(nsCapabilities: INsCapabilities): FrameComparer;
export declare class FrameComparer {
    private _nsCapabilities;
    private _storage;
    private _logPath;
    private _frameComparer;
    private _framesGeneralName;
    private _cropImageRect;
    constructor(_nsCapabilities: INsCapabilities, _storage: string, _logPath: string, _frameComparer: frComparer.FrameComparer);
    processVideo(videoFullName: any, framesGeneralName?: string, videoTempStorage?: string): Promise<void>;
    compareFrameRanges(imageFrameCount: number, startRange: any, endRange: any, logImageComparisonResults?: boolean, tollerancePixels?: number, verbose?: boolean): Promise<boolean>;
    compareFrames(imageFrameCount: number, tolleranceRange?: number, tollerancePixels?: number, logImageComparisonResults?: boolean, verbose?: boolean): Promise<boolean>;
}
