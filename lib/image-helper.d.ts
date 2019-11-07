import { ImageOptions } from "./image-options";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IRectangle } from "./interfaces/rectangle";
import { UIElement } from "./ui-element";
import { AppiumDriver } from "./appium-driver";
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
     * Wait milliseconds before capture creating image
     * Default value is 5000
     */
    waitBeforeCreatingInitialImageCapture?: number;
    /**
     * This property will preserve not to add be added _actual postfix on initial image capture
     */
    donNotAppendActualSuffixOnIntialImageCapture?: boolean;
    /**
     * This property will ensure that the image name will not be manipulated with count postfix.
     * This is very convenient in order to reuses image.
     * Default value is false.
     */
    keepOriginalImageName?: boolean;
    /**
     * Clip image before compare. Default value excludes status bar(both android and ios) and software buttons(android).
     */
    cropRectangle?: IRectangle;
    /**
     * Default value is set to true which means that nativescript-dev-appium will save the image
     * in original size and compare only the part which cropRectangle specifies.
     * If false, the image size will be reduced and saved by the dimensions of cropRectangle.
     */
    keepOriginalImageSize?: boolean;
    /**
     * Default value is set to false. nativescript-dev-appium will recalculate view port for iOS
     * so that the top/y will start from the end of the status bar
     * So far appium calculates it even more and some part of safe areas are missed
     */
    keepAppiumViewportRect?: boolean;
    /**
     * Defines if an image is device-specific or only by the platform.
     * Default value is true and the image will be saved in device-specific directory.
     * If the value is set to false, the image will be saved under ios or android folder.
     */
    isDeviceSpecific?: boolean;
    /**
     * Overwrite actual image if doesn't match. Default value is false.
     */
    overwriteActualImage?: boolean;
}
export declare class ImageHelper {
    private _args;
    private _driver;
    private _blockOutAreas;
    private _imagesResults;
    private _options;
    private _defaultToleranceType;
    private _defaultTolerance;
    private _defaultOptions;
    constructor(_args: INsCapabilities, _driver: AppiumDriver);
    static readonly pngFileExt = ".png";
    testName: string;
    /**
     * Defines when an image output should be created.
     * This can be for different images, similar or different images, or all comparisons.
     * (default: BlinkDiff.OUTPUT_ALL)
     */
    imageOutputLimit: ImageOptions;
    /**
     * Max. distance colors in the 4 dimensional color-space without triggering a difference. (default: 20)
     */
    delta: number;
    options: IImageCompareOptions;
    blockOutAreas: IRectangle[];
    defaultToleranceType: ImageOptions;
    defaultTolerance: number;
    compareScreen(options?: IImageCompareOptions): Promise<boolean>;
    compareElement(element: UIElement, options?: IImageCompareOptions): Promise<boolean>;
    compareRectangle(cropRectangle: IRectangle, options?: IImageCompareOptions): Promise<boolean>;
    hasImageComparisonPassed(): boolean;
    /**
     * Reset image comparison results
     */
    reset(): void;
    /**
     * Set comparison option to default
     */
    resetDefaultOptions(): void;
    getExpectedImagePathByDevice(imageName: string): string;
    getExpectedImagePathByPlatform(imageName: string): string;
    compare(options: IImageCompareOptions): Promise<boolean>;
    compareImages(options: IImageCompareOptions, actual: string, expected: string, output: string): Promise<boolean>;
    clipRectangleImage(rect: IRectangle, path: string): Promise<{}>;
    readImage(path: string): Promise<any>;
    private runDiff;
    private increaseImageName;
    extendOptions(options: IImageCompareOptions): IImageCompareOptions;
    private static fullClone;
}
