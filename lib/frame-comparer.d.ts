import { INsCapabilities } from "./interfaces/ns-capabilities";
export declare function loadFrameComparer(nsCapabilities: INsCapabilities): FrameComparer;
export declare class FrameComparer {
    private _nsCapabilities;
    private _storage;
    private _logPath;
    private _frameComparer;
    private _framesGeneralName;
    constructor(_nsCapabilities: INsCapabilities, _storage: string, _logPath: string, _frameComparer: any);
    processVideo(videoFullName: any, framesGeneralName?: string): Promise<void>;
    compareFrames(imageFrameCount: number, tolleranceRange?: number, tollerancePixels?: number): Promise<any>;
}
