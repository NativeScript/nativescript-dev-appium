import { ImageOptions } from "./image-options";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IRectangle } from "./interfaces/rectangle";
import { UIElement } from "./ui-element";
import { AppiumDriver } from "./appium-driver";
export interface IImageCompareOptions {
    imageName?: string;
    timeOutSeconds?: number;
    tolerance?: number;
    toleranceType?: ImageOptions;
    /**
     * Wait miliseconds before capture of first image
     * Default value is 2000
     */
    waitOnCreatingInitialImageCapture?: number;
    /**
     * This property will preserve not to add be added _actual postfix on initial image capture
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
     * Default value is set to true which means that nativescript-dev-appium will save the image
     * in original size and compare only the part which cropRectangele specifies.
     * If false, the image size will be reduced and saved by the dimensions of cropRectangele.
     */
    shouldPreserveActualImageSize?: boolean;
    /**
     * Defines if an image is device specific or only by platform.
     * Default value is true and the image will be saved in device specific directory.
     * If value is set to false, image will be saved under ios or android folder.
     */
    isDeviceSpecific?: boolean;
}
export declare class ImageHelper {
    private _args;
    private _driver;
    private _blockOutAreas;
    private _imagesResults;
    private _testName;
    private _imageCropRect;
    static readonly pngFileExt = ".png";
    private _options;
    private _defaultOptions;
    constructor(_args: INsCapabilities, _driver: AppiumDriver);
    options: IImageCompareOptions;
    testName: string;
    imageComppareOptions: IImageCompareOptions;
    compareScreen(options?: IImageCompareOptions): Promise<boolean>;
    compareElement(element: UIElement, options?: IImageCompareOptions): Promise<boolean>;
    compareRectangle(cropRectangle: IRectangle, options?: IImageCompareOptions): Promise<boolean>;
    hasImageComparisonPassed(): boolean;
    /**
     * Reset image comparison results
     */
    reset(): void;
    resetDefaultOptions(): void;
    private increaseImageName;
    private extendOptions;
    imageCropRect: IRectangle;
    blockOutAreas: IRectangle[];
    imageOutputLimit(): ImageOptions;
    thresholdType(): ImageOptions;
    threshold(thresholdType: any): 0.01 | 10;
    delta(): number;
    getExpectedImagePathByDevice(imageName: string): string;
    getExpectedImagePathByPlatform(imageName: string): string;
    compare(options: IImageCompareOptions): Promise<boolean>;
    private runDiff;
    compareImages(actual: string, expected: string, output: string, valueThreshold?: number, typeThreshold?: any): Promise<boolean>;
    clipRectangleImage(rect: IRectangle, path: string): Promise<{}>;
    readImage(path: string): Promise<any>;
    private static fullClone;
}
