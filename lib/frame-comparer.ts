import { mkdirSync } from "fs";
import { resolve, getStorageByDeviceName, getReportPath } from "./utils";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDevice } from "mobile-devices-controller";
import * as frComparer from "frame-comparer";
import { IRectangle } from "..";
import { ImageHelper } from "./image-helper";

export function loadFrameComparer(nsCapabilities: INsCapabilities) {
    try {
        const frameComparer = frComparer.createFrameComparer();
        const storage = getStorageByDeviceName(nsCapabilities);
        const logPath = getReportPath(nsCapabilities);
        return new FrameComparer(nsCapabilities, storage, logPath, frameComparer);
    } catch (error) {
        console.error("In order to use frame comaprer, please read carefully https://github.com/SvetoslavTsenov/frame-comparer/blob/master/README.md for dependecies that are required!");
    }
}

export class FrameComparer {
    private _framesGeneralName: string = "frame";
    private _cropImageRect: IRectangle;

    constructor(private _nsCapabilities: INsCapabilities, private _storage: string, private _logPath: string, private _frameComparer: frComparer.FrameComparer) {
        this._cropImageRect = ImageHelper.cropImageDefault(this._nsCapabilities);
    }

    async processVideo(videoFullName, framesGeneralName?: string, videoTempStorage = "tempFramesFolder") {
        this._framesGeneralName = framesGeneralName || this._framesGeneralName;
        this._framesGeneralName = this._framesGeneralName.replace(/\s/gi, "");
        await this._frameComparer.processVideo(videoFullName, videoTempStorage, this._framesGeneralName);
    }

    async compareFrameRanges(imageFrameCount: number, startRange, endRange, logImageComparisonResults: boolean = false, tollerancePixels = 0.1, verbose = false): Promise<boolean> {
        const result = await this._frameComparer.compareImageFromVideo(resolve(this._storage, `${this._framesGeneralName}${imageFrameCount}.png`), this._logPath, startRange, endRange, tollerancePixels, this._cropImageRect, true, logImageComparisonResults, verbose);
        return result;
    }

    async compareFrames(imageFrameCount: number, tolleranceRange = 3, tollerancePixels = 0.1, logImageComparisonResults: boolean = false, verbose = false): Promise<boolean> {
        const start = imageFrameCount - tolleranceRange > 0 ? imageFrameCount - tolleranceRange : 0;
        const end = imageFrameCount + tolleranceRange;
        const result = await this.compareFrameRanges(imageFrameCount, start, end, logImageComparisonResults, tollerancePixels)
        return result;
    }
}