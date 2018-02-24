import { mkdirSync } from "fs";
import { resolve, getStorageByDeviceName, getReportPath } from "./utils";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IDevice } from "mobile-devices-controller";

export function loadFrameComparer(nsCapabilities: INsCapabilities) {
    try {
        const frameComparerPlugin = require("frame-comparer");
        const frameComparer = new frameComparerPlugin.createFrameComparer();
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

    async processVideo(videoFullName, framesGeneralName?: string) {
        this._framesGeneralName = framesGeneralName || this._framesGeneralName;
        await this._frameComparer.processVideo(videoFullName, "tempFramesFolder", this._framesGeneralName);
    }

    // async compareFrames(imageFrameCount: number, startRange, endRange) {
    //     const result = await this._frameComparer.compareImageFromVideo(resolve(this._storage, `${this._framesGeneralName}${imageFrameCount}.png`), startRange, startRange);
    //     return result;
    // }

    async compareFrames(imageFrameCount: number, tolleranceRange = 3, tollerancePixels = 0.1) {
        const start = imageFrameCount - tolleranceRange > 0 ? imageFrameCount - tolleranceRange : 0;
        const end = imageFrameCount + tolleranceRange;
        const result = await this._frameComparer.compareImageFromVideo(resolve(this._storage, `${this._framesGeneralName}${imageFrameCount}.png`), this._logPath, start, end, tollerancePixels);
        return result;
    }
}