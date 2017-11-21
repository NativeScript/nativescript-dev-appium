import * as blinkDiff from "blink-diff";
import { ImageOptions } from "./image-options";
import { INsCapabilities } from "./ins-capabilities";

export class ImageHelper {

    private _cropImageRec: { x: number, y: number, width: number, height: number };
    private _blockOutAreas: { x: number, y: number, width: number, height: number }[];

    constructor(private _args: INsCapabilities) {
    }

    get cropImageRec() {
        return this._cropImageRec;
    }

    set cropImageRec(rect: { x: number, y: number, width: number, height: number }) {
        this._cropImageRec = rect;
    }

    get blockOutAreas() {
        return this._blockOutAreas;
    }

    set blockOutAreas(rectangles: { x: number, y: number, width: number, height: number }[]) {
        this._blockOutAreas = rectangles;
    }

    public imageOutputLimit() {
        return ImageOptions.outputAll;
    }

    public thresholdType() {
        return ImageOptions.pixel;
    }

    public threshold() {
        return 0.1; // 0.1 percent; 500 percent
    }

    public delta() {
        return 20;
    }

    private static getOffsetPixels(args: INsCapabilities) {
        return args.device.config ? args.device.config.offsetPixels : 0
    }

    public static cropImageDefaultParams(_args: INsCapabilities) {
        return { x: 0, y: ImageHelper.getOffsetPixels(_args) };
    }

    private runDiff(diffOptions: blinkDiff, diffImage: string) {
        return new Promise<boolean>((resolve, reject) => {
            diffOptions.run(function (error, result) {
                if (error) {
                    throw error;
                } else {
                    let message;
                    let resultCode = diffOptions.hasPassed(result.code);
                    if (resultCode) {
                        message = "Screen compare passed!";
                        console.log(message);
                        console.log('Found ' + result.differences + ' differences.');
                        return resolve(true);
                    } else {
                        message = "Screen compare failed!";
                        console.log(message);
                        console.log('Found ' + result.differences + ' differences.');
                        console.log('Diff image: ' + diffImage);
                        return resolve(false);
                    }
                }
            });
        });
    }

    public compareImages(actual: string, expected: string, output: string, valueThreshold: number = this.threshold(), typeThreshold: any = ImageOptions.pixel) {
        const rectToCrop = this._cropImageRec || ImageHelper.cropImageDefaultParams(this._args);
        let diff = new blinkDiff({

            imageAPath: actual,
            imageBPath: expected,
            imageOutputPath: output,
            imageOutputLimit: this.imageOutputLimit(),
            thresholdType: typeThreshold,
            threshold: valueThreshold,
            delta: this.delta(),

            cropImageA: rectToCrop,
            cropImageB: rectToCrop,
            blockOut: this._blockOutAreas,
            verbose: this._args.verbose,
        });

        const result = this.runDiff(diff, output);
        this._blockOutAreas = undefined;
        return result;
    }
}
