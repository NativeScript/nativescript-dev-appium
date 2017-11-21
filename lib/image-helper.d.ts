import { ImageOptions } from "./image-options";
import { INsCapabilities } from "./ins-capabilities";
export declare class ImageHelper {
    private _args;
    private _cropImageRec;
    constructor(_args: INsCapabilities);
    cropImageRec: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    imageOutputLimit(): ImageOptions;
    thresholdType(): ImageOptions;
    threshold(): number;
    delta(): number;
    private static getOffsetPixels(args);
    static cropImageDefaultParams(_args: INsCapabilities): {
        x: number;
        y: any;
    };
    private runDiff(diffOptions, diffImage);
    compareImages(actual: string, expected: string, output: string, valueThreshold?: number, typeThreshold?: any): Promise<boolean>;
}
