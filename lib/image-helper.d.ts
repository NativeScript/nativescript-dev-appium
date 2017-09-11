import { ImageOptions } from "./image-options";
export declare class ImageHelper {
    imageOutputLimit(): ImageOptions;
    thresholdType(): ImageOptions;
    threshold(): number;
    delta(): number;
    cropImageA(): {
        x: number;
        y: number;
    };
    cropImageB(): {
        x: number;
        y: number;
    };
    verbose(): boolean;
    private runDiff(diffOptions, diffImage);
    compareImages(actual: string, expected: string, output: string, valueThreshold?: number, typeThreshold?: any): Promise<boolean>;
}
