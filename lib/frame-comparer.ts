import { mkdirSync } from "fs";
import { resolve, getStorageByDeviceName, getReportPath } from "./utils";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import * as frComparer from "frame-comparer";
import { IRectangle } from "..";
import { ImageHelper } from "./image-helper";

export function loadFrameComparer(nsCapabilities: INsCapabilities) {
    try {
        const storage = getStorageByDeviceName(nsCapabilities);
        const logPath = getReportPath(nsCapabilities);
        return new FrameComparer(nsCapabilities, storage, logPath);
    } catch (error) {
        console.error("In order to use frame comaprer, please read carefully https://github.com/SvetoslavTsenov/frame-comparer/blob/master/README.md for dependecies that are required!");
    }
}

export class FrameComparer {
    private _framesGeneralName: string = "frame";
    private _cropImageRect: IRectangle;

    constructor(private _nsCapabilities: INsCapabilities, private _storage: string, private _logPath: string) {
        this._cropImageRect = ImageHelper.cropImageDefault(this._nsCapabilities);
    }

    async processVideo(videoFullName, framesGeneralName?: string, videoTempStorage = "tempFramesFolder") {
        this._framesGeneralName = framesGeneralName || this._framesGeneralName;
        this._framesGeneralName = this._framesGeneralName.replace(/\s/gi, "");
        return await frComparer.FrameComparer.processVideo(videoFullName, videoTempStorage, this._framesGeneralName);
    }

    async compareFrameRanges(frames: Array<string>, imageFrameCount: number, startRange, endRange, logImageComparisonResults: boolean = false, tollerancePixels = 0.1, verbose = false): Promise<boolean> {
        const result = await frComparer.FrameComparer.compareImageFromVideo(frames, resolve(this._storage, `${this._framesGeneralName}${imageFrameCount}.png`), this._logPath, startRange, endRange, tollerancePixels, true, logImageComparisonResults, this._cropImageRect, verbose);
        return result;
    }

    async compareFrames(frames: Array<string>, imageFrameCount: number, tolleranceRange = 3, tollerancePixels = 0.1, logImageComparisonResults: boolean = false, verbose = false): Promise<boolean> {
        const start = imageFrameCount - tolleranceRange > 0 ? imageFrameCount - tolleranceRange : 0;
        const end = imageFrameCount + tolleranceRange;
        const result = await this.compareFrameRanges(frames, imageFrameCount, start, end, logImageComparisonResults, tollerancePixels)
        return result;
    }
}