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
    private _imageCropRect;
    private _options;
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
    imageCropRect: IRectangle;
    blockOutAreas: IRectangle[];
    compareScreen(options?: IImageCompareOptions): Promise<boolean>;
    compareElement(element: UIElement, options?: IImageCompareOptions): Promise<boolean>;
    compareRectangle(cropRectangle: IRectangle, options?: IImageCompareOptions): Promise<boolean>;
    hasImageComparisonPassed(): boolean;
    /**
     * Reset image comparison results
     */
    reset(): void;
    /**
     * Set coparison option to default
     */
    resetDefaultOptions(): void;
    getExpectedImagePathByDevice(imageName: string): string;
    getExpectedImagePathByPlatform(imageName: string): string;
    compare(options: IImageCompareOptions): Promise<boolean>;
    compareImages(actual: string, expected: string, output: string, tolerance: number, toleranceType: ImageOptions): Promise<boolean>;
    clipRectangleImage(rect: IRectangle, path: string): Promise<{}>;
    readImage(path: string): Promise<any>;
    private runDiff;
    private increaseImageName;
    extendOptions(options: IImageCompareOptions): IImageCompareOptions;
    private static fullClone;
}
