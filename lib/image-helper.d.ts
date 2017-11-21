import { ImageOptions } from "./image-options";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IRectangle } from "./interfaces/rectangle";
export declare class ImageHelper {
    private _args;
    private _cropImageRect;
    private _blockOutAreas;
    constructor(_args: INsCapabilities);
    readonly cropImageRect: IRectangle;
    cropImageRec: IRectangle;
    blockOutAreas: IRectangle[];
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
