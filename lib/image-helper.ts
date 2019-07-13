import * as BlinkDiff from "blink-diff";
import * as PngJsImage from "pngjs-image";
import { ImageOptions } from "./image-options";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IRectangle } from "./interfaces/rectangle";
import { LogImageType } from "./enums/log-image-type";
import { UIElement } from "./ui-element";
import { AppiumDriver } from "./appium-driver";
import { logError, checkImageLogType, resolvePath, copy, addExt, logWarn } from "./utils";
import { unlinkSync, existsSync, mkdirSync } from "fs";
import { basename, join } from "path";
import { isObject } from "util";
import { logInfo } from "../../mobile-devices-controller/lib/utils";

export interface IImageCompareOptions {
    imageName?: string;
    timeOutSeconds?: number;

    /**
     * pixel
     * percentage thresholds: 1 = 100%, 0.2 = 20%"
     */
    tolerance?: number;

    /**
     * pixel
     * percentage thresholds: 1 = 100%, 0.2 = 20%"
    */
    toleranceType?: ImageOptions;
    /**
     * Wait miliseconds before capture creating image
     * Default value is 2000
     */
    waitBeforeCreatingInitialImageCapture?: number;

    /**
     * This property will preserve not to add be added _actual postfix on initial image capture
     */
    donNotAppendActualSuffixOnIntialImageCapture?: boolean;

    /**
     * This property will ensure that the image name will not be manipulated with count postfix.
     * This is very convinient in order to resuse image.
     * Default value is false.
     */
    keepOriginalImageName?: boolean;

    /**
     * Clip image before comapare. Default value excludes status bar(both android and ios) and softare buttons(android).
     */
    cropRectangle?: IRectangle;

    /**
     * Default value is set to true which means that nativescript-dev-appium will save the image
     * in original size and compare only the part which cropRectangele specifies. 
     * If false, the image size will be reduced and saved by the dimensions of cropRectangele.
     */
    keepOriginalImageSize?: boolean;


    /**
     * Default value is set to false. nativescript-dev-appium will recalculate view port for iOS
     * so that the top/y will start from the end of status bar
     * So far appium calcuates it even more and some part of safe areas are missed
     */
    keepAppiumViewportRect?: boolean;

    /**
     * Defines if an image is device specific or only by platform.
     * Default value is true and the image will be saved in device specific directory.
     * If value is set to false, image will be saved under ios or android folder.
     */
    isDeviceSpecific?: boolean;
}

export class ImageHelper {
    private _blockOutAreas: IRectangle[];
    private _imagesResults = new Map<string, boolean>();
    private _imageCropRect: IRectangle;
    private _options: IImageCompareOptions = {};
    private _defaultOptions: IImageCompareOptions = {
        timeOutSeconds: 2,
        tolerance: 0,
        toleranceType: ImageOptions.pixel,
        waitBeforeCreatingInitialImageCapture: 4000,
        donNotAppendActualSuffixOnIntialImageCapture: false,
        keepOriginalImageSize: true,
        keepOriginalImageName: false,
        isDeviceSpecific: true,
        cropRectangle: {},
        imageName: undefined,
    };

    constructor(private _args: INsCapabilities, private _driver: AppiumDriver) {
        this._defaultOptions.cropRectangle = (this._args.appiumCaps && this._args.appiumCaps.viewportRect) || this._args.device.viewportRect;
        if (!this._defaultOptions.cropRectangle
            || this._defaultOptions.cropRectangle.y === undefined
            || this._defaultOptions.cropRectangle.y === null
            || this._defaultOptions.cropRectangle.y === NaN) {
            this._defaultOptions.cropRectangle = this._defaultOptions.cropRectangle || {};
            this._defaultOptions.cropRectangle.y = this._args.device.config.offsetPixels || 0;
            this._defaultOptions.cropRectangle.x = 0;
        }
        ImageHelper.fullClone(this._defaultOptions, this._options);

        logInfo(`Actual view port:`, this._options);
    }

    public static readonly pngFileExt = '.png';

    public testName: string;

    /**
     * Defines when an image output should be created. 
     * This can be for different images, similar or different images, or all comparisons. 
     * (default: BlinkDiff.OUTPUT_ALL)
     */
    public imageOutputLimit = ImageOptions.outputAll;

    /**
     * Max. distance colors in the 4 dimensional color-space without triggering a difference. (default: 20)
     */
    public delta: number = 20;

    get options() {
        return this._options;
    }

    set options(options: IImageCompareOptions) {
        this._options = this.extendOptions(options);
    }

    get imageCropRect(): IRectangle {
        return this._imageCropRect || this.options.cropRectangle;
    }

    set imageCropRect(clipRectangele: IRectangle) {
        this._imageCropRect = clipRectangele;
    }

    get blockOutAreas() {
        return this._blockOutAreas;
    }

    set blockOutAreas(rectangles: IRectangle[]) {
        this._blockOutAreas = rectangles;
    }

    public async compareScreen(options?: IImageCompareOptions) {
        options = this.extendOptions(options);
        options.imageName = this.increaseImageName(options.imageName || this.testName, options);
        const result = await this.compare(options);
        this._imagesResults.set(options.imageName, result);

        return result;
    }

    public async compareElement(element: UIElement, options?: IImageCompareOptions) {
        options = this.extendOptions(options);
        options.imageName = this.increaseImageName(options.imageName || this.testName, options);
        const cropRectangele = await element.getRectangle();
        const result = await this.compareRectangle(cropRectangele, options);

        return result;
    }

    public async compareRectangle(cropRectangle: IRectangle, options?: IImageCompareOptions) {
        options = this.extendOptions(options);
        options.imageName = this.increaseImageName(options.imageName || this.testName, options);
        options.cropRectangle = cropRectangle;
        const result = await this.compare(options);
        this._imagesResults.set(options.imageName, result);

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

    /**
     * Reset image comparison results
     */
    public reset() {
        this._imagesResults.clear();
        this.testName = undefined;
    }

    /**
     * Set coparison option to default
     */
    public resetDefaultOptions() {
        ImageHelper.fullClone(this._defaultOptions, this._options);
    }

    public getExpectedImagePathByDevice(imageName: string) {
        let pathExpectedImage = resolvePath(this._args.storageByDeviceName, imageName);
        return pathExpectedImage;
    }

    public getExpectedImagePathByPlatform(imageName: string) {
        let pathExpectedImage = resolvePath(this._args.storageByPlatform, imageName);
        return pathExpectedImage;
    }

    public async compare(options: IImageCompareOptions) {
        let imageName = addExt(options.imageName, ImageHelper.pngFileExt);
        const storageLocal = options.isDeviceSpecific ? this._args.storageByDeviceName : this._args.storageByPlatform;
        const pathExpectedImage = options.isDeviceSpecific ? this.getExpectedImagePathByDevice(imageName) : this.getExpectedImagePathByPlatform(imageName);

        if (!existsSync(this._args.reportsPath)) {
            mkdirSync(this._args.reportsPath);
        }
        // First time capture
        if (!existsSync(pathExpectedImage)) {
            const pathActualImage = resolvePath(storageLocal, this.options.donNotAppendActualSuffixOnIntialImageCapture ? imageName : imageName.replace(".", "_actual."));
            if (this.options.waitBeforeCreatingInitialImageCapture > 0) {
                await this._driver.wait(this.options.waitBeforeCreatingInitialImageCapture);
            }
            await this._driver.saveScreenshot(pathActualImage);

            if (!options.keepOriginalImageSize) {
                await this.clipRectangleImage(options.cropRectangle, pathActualImage);
            }

            const pathActualImageToReportsFolder = resolvePath(this._args.reportsPath, basename(pathActualImage));
            copy(pathActualImage, pathActualImageToReportsFolder, false);

            if (this.options.donNotAppendActualSuffixOnIntialImageCapture) {
                logWarn(`New image ${basename(pathActualImage)} is saved to storage ${storageLocal}.`, pathExpectedImage);
            } else {
                logWarn("Remove the 'actual' suffix to continue using the image as expected one ", pathExpectedImage);
            }
            this._args.testReporterLog(basename(pathActualImage).replace(/\.\w{3,3}$/ig, ""));
            this._args.testReporterLog(join(this._args.reportsPath, basename(pathActualImage)));
            return false;
        }

        // Compare
        let pathActualImage = await this._driver.saveScreenshot(resolvePath(this._args.reportsPath, imageName.replace(".", "_actual.")));
        if (!options.keepOriginalImageSize) {
            await this.clipRectangleImage(options.cropRectangle, pathActualImage);
        }
        const pathDiffImage = pathActualImage.replace("actual", "diff");

        // await this.prepareImageToCompare(pathActualImage, options.cropRectangele);
        let result = await this.compareImages(pathActualImage, pathExpectedImage, pathDiffImage, options.tolerance, options.toleranceType);

        // Iterate
        if (!result) {
            const eventStartTime = Date.now().valueOf();
            let counter = 1;
            options.timeOutSeconds *= 1000;
            while ((Date.now().valueOf() - eventStartTime) <= options.timeOutSeconds && !result) {
                const pathActualImageConter = resolvePath(this._args.reportsPath, imageName.replace(".", "_actual_" + counter + "."));
                pathActualImage = await this._driver.saveScreenshot(pathActualImageConter);
                if (!options.keepOriginalImageSize) {
                    await this.clipRectangleImage(options.cropRectangle, pathActualImage);
                }
                // await this.prepareImageToCompare(pathActualImage, this.imageCropRect);
                result = await this.compareImages(pathActualImage, pathExpectedImage, pathDiffImage, options.tolerance, options.toleranceType);
                if (!result && checkImageLogType(this._args.testReporter, LogImageType.everyImage)) {
                    this._args.testReporterLog(`Actual image: ${basename(pathActualImage).replace(/\.\w{3,3}$/ig, "")}`);
                    this._args.testReporterLog(join(this._args.reportsPath, basename(pathActualImage)));
                }
                counter++;
            }

            if (!result && !checkImageLogType(this._args.testReporter, LogImageType.everyImage)) {
                this._args.testReporterLog(`${basename(pathDiffImage).replace(/\.\w{3,3}$/ig, "")}`);
                this._args.testReporterLog(join(this._args.reportsPath, basename(pathDiffImage)));
                this._args.testReporterLog(`Actual image: ${basename(pathActualImage).replace(/\.\w{3,3}$/ig, "")}`);
                this._args.testReporterLog(join(this._args.reportsPath, basename(pathActualImage)));
            }
        } else {
            if (existsSync(pathDiffImage)) {
                unlinkSync(pathDiffImage);
            }
            if (existsSync(pathActualImage)) {
                unlinkSync(pathActualImage);
            }
        }

        return result;
    }

    public compareImages(actual: string, expected: string, output: string, tolerance: number, toleranceType: ImageOptions) {
        const clipRect = {
            x: this.imageCropRect.x,
            y: this.imageCropRect.y,
            width: this.imageCropRect.width,
            height: this.imageCropRect.height
        }

        if (!this.options.keepOriginalImageSize) {
            clipRect.x = 0;
            clipRect.y = 0;
            clipRect.width = undefined;
            clipRect.height = undefined;
        }

        const diff = new BlinkDiff({
            imageAPath: actual,
            imageBPath: expected,
            imageOutputPath: output,
            imageOutputLimit: this.imageOutputLimit,
            thresholdType: toleranceType,
            threshold: tolerance,
            delta: this.delta,
            cropImageA: clipRect,
            cropImageB: clipRect,
            blockOut: this._blockOutAreas,
            verbose: this._args.verbose,
        });

        if (toleranceType == ImageOptions.percent) {
            if (tolerance >= 1) {
                logError("Tolerance range is from 0 to 1 -> percentage thresholds: 1 = 100%, 0.2 = 20%");
            }
            console.log(`Using ${tolerance * 100}% tolerance`);
        } else {
            console.log(`Using ${tolerance}px tolerance`);
        }

        const result = this.runDiff(diff, output);
        this._blockOutAreas = undefined;
        return result;
    }

    public async clipRectangleImage(rect: IRectangle, path: string) {
        let imageToClip: PngJsImage;
        imageToClip = await this.readImage(path);
        let shouldExit = false;
        Object.getOwnPropertyNames(rect).forEach(prop => {
            if (rect[prop] === undefined || rect[prop] === null) {
                shouldExit = true;
                return;
            }
        });
        if (shouldExit) {
            logError(`Could not crop the image. Not enough data`, rect);
            return
        }
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

    private runDiff(diffOptions: BlinkDiff, diffImage: string) {
        var that = this;
        return new Promise<boolean>((resolve, reject) => {
            diffOptions.run(function (error, result) {
                if (error) {
                    throw error;
                } else {
                    const resultCode = diffOptions.hasPassed(result.code);
                    if (resultCode) {
                        console.log('Screen compare passed! Found ' + result.differences + ' differences.');
                        return resolve(true);
                    } else {
                        const message = `Screen compare failed! Found ${result.differences} differences.\n`;
                        console.log(message);
                        if (Object.getOwnPropertyNames(that._args.testReporter).length > 0) {
                            that._args.testReporterLog(message);
                            if (that._args.testReporter.logImageTypes
                                && that._args.testReporter.logImageTypes.indexOf(LogImageType.everyImage) > -1) {
                                that._args.testReporterLog(`${basename(diffImage)} - ${message}`);
                                that._args.testReporterLog(diffImage);
                            }
                        }
                        return resolve(false);
                    }
                }
            });
        });
    }

    private increaseImageName(imageName: string, options: IImageCompareOptions) {
        if (options.keepOriginalImageName) {
            return imageName;
        }
        if (!imageName) {
            logError(`Missing image name!`);
            logError(`Consider to set
            drive.imageHelper.testName
            dirver.imageHelper.options.imageName`);
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

    public extendOptions(options: IImageCompareOptions) {
        options = options || {};
        Object.getOwnPropertyNames(this.options).forEach(prop => {
            if (options[prop] === undefined || options[prop] === null) {
                if (isObject(this.options[prop])) {
                    options[prop] = {};
                    ImageHelper.fullClone(this.options[prop], options[prop]);
                } else {
                    options[prop] = this.options[prop];
                }
            }
        });

        if (!options.cropRectangle) {
            ImageHelper.fullClone(this.imageCropRect, this.imageCropRect);
        }

        return options;
    }

    private static fullClone(src, target) {
        Object.getOwnPropertyNames(src)
            .forEach(prop => {
                if (isObject(src[prop])) {
                    target[prop] = {};
                    ImageHelper.fullClone(src[prop], target[prop]);
                } else {
                    if (target[prop] === undefined || target[prop] === null) {
                        target[prop] = src[prop];
                    }
                }
            });
    }
}
