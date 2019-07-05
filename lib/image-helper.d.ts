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
export declare class ImageHelper {
    private _args;
    private _driver;
    private _blockOutAreas;
    private _imagesResults;
    private _testName;
    private _imageCropRect;
    static readonly pngFileExt = ".png";
    private _options;
    constructor(_args: INsCapabilities, _driver: AppiumDriver);
    options: IImageCompareOptions;
    testName: string;
    imageComppareOptions: IImageCompareOptions;
    compareScreen(options?: IImageCompareOptions): Promise<boolean>;
    compareElement(element: UIElement, options?: IImageCompareOptions): Promise<boolean>;
    compareRectangle(cropRectangle: IRectangle, options?: IImageCompareOptions): Promise<boolean>;
    hasImageComparisonPassed(): boolean;
    reset(): void;
    private increaseImageName;
    private extendOptions;
    imageCropRect: IRectangle;
    blockOutAreas: IRectangle[];
    imageOutputLimit(): ImageOptions;
    thresholdType(): ImageOptions;
    threshold(thresholdType: any): 10 | 0.01;
    delta(): number;
    getExpectedImagePath(imageName: string): string;
    compare(options: IImageCompareOptions): Promise<boolean>;
    private runDiff;
    compareImages(actual: string, expected: string, output: string, valueThreshold?: number, typeThreshold?: any): Promise<boolean>;
    clipRectangleImage(rect: IRectangle, path: string): Promise<{}>;
    readImage(path: string): Promise<any>;
}
