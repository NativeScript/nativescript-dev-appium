import { basename } from "path";
import * as BlinkDiff from "blink-diff";
import * as PngJsImage from "pngjs-image";
import { ImageOptions } from "./image-options";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IRectangle } from "./interfaces/rectangle";
import { LogImageType } from "./enums/log-image-type";
import { UIElement } from "./ui-element";
import { AppiumDriver } from "./appium-driver";
import { logError } from "./utils";

export interface IImageCompareOptions {
    imageName?: string;
    timeOutSeconds?: number;
    tolerance?: number;
    toleranceType?: ImageOptions;
    /**
     * wait miliseconds before capture creating image
     */
    waitOnCreatingInitialSnapshot?: number;
    /**
     * This property will keep image name as it is and will not add _actual postfix on initial capture
     */
    preserveImageName?: boolean;
}

export class ImageHelper {

    private _imageCropRect: IRectangle;
    private _blockOutAreas: IRectangle[];
    private _imagesResults = new Map<string, boolean>();
    private _testName: string;
    private _options: IImageCompareOptions = {
        timeOutSeconds: 2,
        tolerance: 0,
        toleranceType: ImageOptions.pixel,
        waitOnCreatingInitialSnapshot: 2000,
        preserveImageName: false,
    };

    constructor(private _args: INsCapabilities, private _driver: AppiumDriver) {
    }

    get options() {
        return this._options;
    }

    set options(options: IImageCompareOptions) {
        this._options = this.extendOptions(options);
    }

    set testName(testName: string) {
        this._testName = testName;
    }

    get testName() {
        return this._testName;
    }

    get imageComppareOptions() {
        this.extendOptions(this._options);

        return this._options;
    }

    set imageComppareOptions(imageComppareOptions: IImageCompareOptions) {
        this._options = this.extendOptions(imageComppareOptions);
    }

    public async compareScreen(options?: IImageCompareOptions) {
        options = this.extendOptions(options);
        const imageName = this.increaseImageName(options.imageName || this._testName);
        const result = await this._driver.compareScreen(imageName, options.timeOutSeconds, options.tolerance, options.toleranceType);
        this._imagesResults.set(imageName, result);

        return result;
    }

    public async compareElement(element: UIElement, options?: IImageCompareOptions) {
        options = this.extendOptions(options);
        const imageName = this.increaseImageName(options.imageName || this._testName);
        const result = await this._driver.compareElement(element, imageName, options.tolerance, options.timeOutSeconds, options.toleranceType);
        this._imagesResults.set(imageName, result);

        return result;
    }

    public async compareRectangle(element: IRectangle, options?: IImageCompareOptions) {
        options = this.extendOptions(options);
        const imageName = this.increaseImageName(options.imageName || this._testName);
        const result = await this._driver.compareRectangle(element, imageName, options.timeOutSeconds, options.tolerance, options.toleranceType);
        this._imagesResults.set(imageName, result);

        return result;
    }

    public hasImageComparisonPassed() {
        let shouldFailTest = true;
        console.log();
        this._imagesResults.forEach((v, k, map) => {
            if (!this._imagesResults.get(k)) {
                shouldFailTest = false;
                this._driver.testReporterLog(`Image comparison for image ${k} has failed!`);
                logError(`Image comparison for image ${k} has failed`);
            }
        });

        this.reset();
        return shouldFailTest;
    }

    public reset() {
        this._imagesResults.clear();
        this.testName = undefined;
    }

    private increaseImageName(imageName: string) {
        if (!imageName) {
            logError(`Missing image name!`);
            logError(`Consider to set
            drive.imageHelper.testName
            dirver.imageHelper.options.imageName
    `);
            throw new Error(`Missing image name!`)
        }
        if (this._imagesResults.size > 0) {
            const images = new Array();
            this._imagesResults.forEach((v, k, map) => {
                if (k.includes(imageName)) {
                    images.push(k);
                }
            });

            images.sort((a, b) => {
                const aNumber = +/\d+$/.exec(a);
                const bNumber = +/\d+$/.exec(b);

                return bNumber - aNumber;
            });
            if (images.length > 0) {
                const lastImage = images[0];
                const number = /\d+$/.test(lastImage) ? +`${/\d+$/.exec(lastImage)}` + 1 : `2`;
                imageName = `${imageName}_${number}`;
            }
        }

        return imageName;
    }

    private extendOptions(options: IImageCompareOptions) {
        options = options || {};
        Object.getOwnPropertyNames(this.options).forEach(prop => {
            if (!options[prop]) {
                options[prop] = this.options[prop];
            }
        });

        return options;
    }

    get imageCropRect(): IRectangle {
        return this._imageCropRect;
    }

    set imageCropRect(rect: IRectangle) {
        this._imageCropRect = rect;
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
        var that = this;
        return new Promise<boolean>((resolve, reject) => {
            diffOptions.run(function (error, result) {
                if (error) {
                    throw error;
                } else {
                    let message: string;
                    let resultCode = diffOptions.hasPassed(result.code);
                    if (resultCode) {
                        message = "Screen compare passed!";
                        console.log(message);
                        console.log('Found ' + result.differences + ' differences.');
                        return resolve(true);
                    } else {
                        message = `Screen compare failed! Found ${result.differences} differences.\n`;
                        console.log(message);
                        if (Object.getOwnPropertyNames(that._args.testReporter).length > 0 && that._args.testReporter.logImageTypes && that._args.testReporter.logImageTypes.indexOf(LogImageType.everyImage) > -1) {
                            that._args.testReporterLog(`${basename(diffImage)}\n\r${message}`);
                            that._args.testReporterLog(diffImage);
                        }
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
            cropImageA: this._imageCropRect,
            cropImageB: this._imageCropRect,
            blockOut: this._blockOutAreas,
            verbose: this._args.verbose,
        });

        if (typeThreshold == ImageOptions.percent) {
            valueThreshold = Math.floor(valueThreshold * 100);
            console.log(`Using ${valueThreshold}\ ${typeThreshold} tolerance`);
        } else {
            console.log(`Using ${valueThreshold} tolerance`);
        }

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
