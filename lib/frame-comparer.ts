import { mkdirSync } from "fs";
import { resolve, getStorageByDeviceName, getReportPath } from "./utils";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDevice } from "mobile-devices-controller";
import { createFrameComparer } from "frame-comparer";

export function loadFrameComparer(nsCapabilities: INsCapabilities) {
    try {
        const frameComparer = createFrameComparer();
        const storage = getStorageByDeviceName(nsCapabilities);
        const logPath = getReportPath(nsCapabilities);
        return new FrameComparer(nsCapabilities, storage, logPath, frameComparer);
    } catch (error) {
        console.error("In order to use frame comaprer, please run npm i frame-comparer and read carefully README.md");
    }
}

export class FrameComparer {
    private _framesGeneralName: string = "frame";

    constructor(private _nsCapabilities: INsCapabilities, private _storage: string, private _logPath: string, private _frameComparer: any) {
    }

    async processVideo(videoFullName, framesGeneralName?: string, videoTempStorage = "tempFramesFolder") {
        this._framesGeneralName = framesGeneralName || this._framesGeneralName;
        this._framesGeneralName = this._framesGeneralName.replace(/\s/gi, "");
        await this._frameComparer.processVideo(videoFullName, videoTempStorage, this._framesGeneralName);
    }

    async compareFrameRanges(imageFrameCount: number, startRange, endRange, tollerancePixels = 0.1) {
        const result = await this._frameComparer.compareImageFromVideo(resolve(this._storage, `${this._framesGeneralName}${imageFrameCount}.png`), this._logPath, startRange, startRange, tollerancePixels);
        return result;
    }

    async compareFrames(imageFrameCount: number, tolleranceRange = 3, tollerancePixels = 0.1) {
        const start = imageFrameCount - tolleranceRange > 0 ? imageFrameCount - tolleranceRange : 0;
        const end = imageFrameCount + tolleranceRange;
        const result = await this._frameComparer.compareImageFromVideo(resolve(this._storage, `${this._framesGeneralName}${imageFrameCount}.png`), this._logPath, start, end, tollerancePixels);
        return result;
    }
}