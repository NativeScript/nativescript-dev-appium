import { ImageOptions } from "./image-options";
import { INsCapabilities } from "./ins-capabilities";
export declare class ImageHelper {
    private _args;
    constructor(_args: INsCapabilities);
    private getOffsetPixels();
    imageOutputLimit(): ImageOptions;
    thresholdType(): ImageOptions;
    threshold(): number;
    delta(): number;
    cropImageA(): {
        x: number;
        y: any;
    };
    cropImageB(): {
        x: number;
        y: any;
    };
    verbose(): boolean;
    private runDiff(diffOptions, diffImage);
    compareImages(actual: string, expected: string, output: string, valueThreshold?: number, typeThreshold?: any): Promise<boolean>;
}
