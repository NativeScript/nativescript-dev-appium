import * as BlinkDiff from "blink-diff";
import * as PngJsImage from "pngjs-image";
import { ImageOptions } from "./image-options";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IRectangle } from "./interfaces/rectangle";
import { LogImageType } from "./enums/log-image-type";
import { UIElement } from "./ui-element";
import { AppiumDriver } from "./appium-driver";
import { logError, checkImageLogType, resolvePath, getStorageByDeviceName, getStorageByPlatform, getReportPath, copy, addExt, logWarn } from "./utils";
import { unlinkSync, existsSync } from "fs";
import { basename, join } from "path";

export interface IImageCompareOptions {
    imageName?: string;
    timeOutSeconds?: number;
    tolerance?: number;
    toleranceType?: ImageOptions;
    /**
     * wait miliseconds before capture creating image
     */
    waitOnCreatingInitialImageCapture?: number;

    /**
     * This property not add _actual postfix on initial image capture
     */
    donNotAppendActualSuffixOnIntialImageCapture?: boolean;

    /**
     * This property will ensure that the image name will not be manipulated with count postfix.
     * This is very convinient in order to resuse image.
     * Default value is false.
     */
    preserveImageName?: boolean;

    /**
     * Clip image before comapare. Default value excludes status bar(both android and ios) and softare buttons(android).
     */
    cropRectangle?: IRectangle;

    /**
     * Default value is set to true which means that nativescript-dev-appium will save the original image and compare only the part which cropRectangele specifies. 
     * If false, the image size will be reduced and saved as cropRectangele dimensions.
     */
    preserveActualImageSize?: boolean;
}

export class ImageHelper {
    private _blockOutAreas: IRectangle[];
    private _imagesResults = new Map<string, boolean>();
    private _testName: string;
    private _imageCropRect: IRectangle;

    public static readonly pngFileExt = '.png';

    private _options: IImageCompareOptions = {
        timeOutSeconds: 2,
        tolerance: 0,
        toleranceType: ImageOptions.pixel,
        waitOnCreatingInitialImageCapture: 2000,
        donNotAppendActualSuffixOnIntialImageCapture: false,
        preserveActualImageSize: true,
        preserveImageName: false
    };

    constructor(private _args: INsCapabilities, private _driver: AppiumDriver) {
        this.options.cropRectangle = (this._args.appiumCaps && this._args.appiumCaps.viewportRect) || this._args.device.viewportRect;
        if (!this.options.cropRectangle || !this.options.cropRectangle.y) {
            this.options.cropRectangle = this.options.cropRectangle || {};
            this.options.cropRectangle.y = this._args.device.config.offsetPixels || 0;
            this.options.cropRectangle.x = 0;
        }
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
        options.imageName = this.increaseImageName(options.imageName || this._testName);
        const result = await this.compare(options);
        this._imagesResults.set(options.imageName, result);

        return result;
    }

    public async compareElement(element: UIElement, options?: IImageCompareOptions) {
        options = this.extendOptions(options);
        options.imageName = this.increaseImageName(options.imageName || this._testName);
        const cropRectangele = await element.getRectangle();
        const result = await this.compareRectangle(cropRectangele, options);

        return result;
    }

    public async compareRectangle(cropRectangle: IRectangle, options?: IImageCompareOptions) {
        options = this.extendOptions(options);
        options.imageName = this.increaseImageName(options.imageName || this._testName);
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

    public reset() {
        this._imagesResults.clear();
        this.testName = undefined;
    }

    private increaseImageName(imageName: string) {
        if (this.options.preserveImageName) {
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

    private extendOptions(options: IImageCompareOptions) {
        options = options || {};
        const clipRectangele = this.imageCropRect;
        Object.getOwnPropertyNames(this.options).forEach(prop => {
            if (!options[prop]) {
                options[prop] = this.options[prop];
            }
        });

        if (!options.cropRectangle) {
            Object.getOwnPropertyNames(clipRectangele).forEach(prop => {
                options.cropRectangle[prop] = clipRectangele[prop];
            });

            this.imageCropRect = options.cropRectangle;
        }

        return options;
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

    public getExpectedImagePath(imageName: string) {
        let pathExpectedImage = resolvePath(this._args.storageByDeviceName, imageName);
        return pathExpectedImage;
    }

    public async compare(options: IImageCompareOptions) {
        let imageName = addExt(options.imageName, ImageHelper.pngFileExt);
        const pathExpectedImage = this.getExpectedImagePath(imageName);

        // First time capture
        if (!existsSync(pathExpectedImage)) {
            const pathActualImage = resolvePath(this._args.storageByDeviceName, this.options.donNotAppendActualSuffixOnIntialImageCapture ? imageName : imageName.replace(".", "_actual."));
            if (this.options.waitOnCreatingInitialImageCapture > 0) {
                await this._driver.wait(this.options.waitOnCreatingInitialImageCapture);
            }
            await this._driver.saveScreenshot(pathActualImage);

            if (!options.preserveActualImageSize) {
                await this.clipRectangleImage(options.cropRectangle, pathActualImage);
            }

            const pathActualImageToReportsFolder = resolvePath(this._args.reportsPath, basename(pathActualImage));
            copy(pathActualImage, pathActualImageToReportsFolder, false);

            if (this.options.donNotAppendActualSuffixOnIntialImageCapture) {
                logWarn(`New image ${basename(pathActualImage)} is saved to storage ${this._args.storageByDeviceName}.`, pathExpectedImage);
            } else {
                logWarn("Remove the 'actual' suffix to continue using the image as expected one ", pathExpectedImage);
            }
            this._args.testReporterLog(basename(pathActualImage).replace(/\.\w{3,3}$/ig, ""));
            this._args.testReporterLog(join(this._args.reportsPath, basename(pathActualImage)));
            return false;
        }

        // Compare
        let pathActualImage = await this._driver.saveScreenshot(resolvePath(this._args.reportsPath, imageName.replace(".", "_actual.")));
        if (!options.preserveActualImageSize) {
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
                if (!options.preserveActualImageSize) {
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

    // public async prepareImageToCompare(filePath: string, rect: IRectangle) {
    //     if (rect) {
    //         await this.clipRectangleImage(rect, filePath);
    //         const rectToCrop = { left: 0, top: 0, width: undefined, height: undefined };
    //         this.imageCropRect = rectToCrop;
    //     } else {
    //         this.imageCropRect = ImageHelper.cropImageDefault(this._args);
    //     }
    // }

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
        const clipRect = {
            x: this.imageCropRect.x,
            y: this.imageCropRect.y,
            width: this.imageCropRect.width,
            height: this.imageCropRect.height
        }

        if (!this.options.preserveActualImageSize) {
            clipRect.x = 0;
            clipRect.y = 0;
            clipRect.width = undefined;
            clipRect.height = undefined;
        }

        const diff = new BlinkDiff({
            imageAPath: actual,
            imageBPath: expected,
            imageOutputPath: output,
            imageOutputLimit: this.imageOutputLimit(),
            thresholdType: typeThreshold,
            threshold: valueThreshold,
            delta: this.delta(),
            cropImageA: clipRect,
            cropImageB: clipRect,
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
}
