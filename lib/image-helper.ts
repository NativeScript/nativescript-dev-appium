import * as BlinkDiff from "blink-diff";
import * as PngJsImage from "pngjs-image";
import { ImageOptions } from "./image-options";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IRectangle } from "./interfaces/rectangle";
import { Point } from "./point";

export class ImageHelper {

    private _cropImageRect: IRectangle;
    private _blockOutAreas: IRectangle[];

    constructor(private _args: INsCapabilities) {
    }

    get imageCropRect(): IRectangle {
        return this._cropImageRect;
    }

    set imageCropRect(rect: IRectangle) {
        this._cropImageRect = rect;
    }

    get blockOutAreas() {
        return this._blockOutAreas;
    }

    set blockOutAreas(rectangles: IRectangle[]) {
        this._blockOutAreas = rectangles;
    }

    public imageOutputLimit() {
        return ImageOptions.outputAll;
    }

    public thresholdType() {
        return ImageOptions.percent;
    }

    public threshold(thresholdType) {
        if (thresholdType == ImageOptions.percent) {
            return 0.01; // 0.01 = 1 percent; 500 percent
        } else {
            return 10; // 10 pixels
        }
    }

    public delta() {
        return 20;
    }

    public static cropImageDefault(_args: INsCapabilities) {
        return { x: 0, y: ImageHelper.getOffsetPixels(_args), width: undefined, height: undefined };
    }

    private static getOffsetPixels(args: INsCapabilities) {
        return args.device.config ? args.device.config.offsetPixels : 0
    }

    private runDiff(diffOptions: BlinkDiff, diffImage: string) {
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

    public compareImages(actual: string, expected: string, output: string, valueThreshold: number = this.threshold(this.thresholdType()), typeThreshold: any = this.thresholdType()) {
        const diff = new BlinkDiff({

            imageAPath: actual,
            imageBPath: expected,
            imageOutputPath: output,
            imageOutputLimit: this.imageOutputLimit(),
            thresholdType: typeThreshold,
            threshold: valueThreshold,
            delta: this.delta(),

            cropImageA: this._cropImageRect,
            cropImageB: this._cropImageRect,
            blockOut: this._blockOutAreas,
            verbose: this._args.verbose,
        });

        if (typeThreshold == ImageOptions.percent) {
            valueThreshold = Math.floor(valueThreshold * 100);
        }

        console.log("Using " + valueThreshold + " " + typeThreshold + "s tolerance");
        const result = this.runDiff(diff, output);
        this._blockOutAreas = undefined;
        return result;
    }

    public async clipRectangleImage(rect: IRectangle, path: string) {
        let imageToClip: PngJsImage;
        imageToClip = await this.readImage(path);
        imageToClip.clip(rect.x, rect.y, rect.width, rect.height);
        return new Promise((resolve, reject) => {
            imageToClip.writeImage(path, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });

        })
    }

    public readImage(path: string): Promise<any> {
        return new Promise((resolve, reject) => {
            PngJsImage.readImage(path, (err, image) => {
                if (err) {
                    return reject(err);
                }
                return resolve(image);
            });
        })
    }
}
