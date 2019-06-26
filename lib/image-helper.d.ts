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
    waitOnCreatingInitialSnapshot?: number;
    /**
     * This property will keep image name as it is and will not add _actual postfix on initial capture
     */
    preserveImageName?: boolean;
}
export declare class ImageHelper {
    private _args;
    private _driver;
    private _imageCropRect;
    private _blockOutAreas;
    private _imagesResults;
    private _testName;
    private _options;
    constructor(_args: INsCapabilities, _driver: AppiumDriver);
    options: IImageCompareOptions;
    testName: string;
    imageComppareOptions: IImageCompareOptions;
    compareScreen(options?: IImageCompareOptions): Promise<boolean>;
    compareElement(element: UIElement, options?: IImageCompareOptions): Promise<boolean>;
    compareRectangle(element: IRectangle, options?: IImageCompareOptions): Promise<boolean>;
    hasImageComparissonPassed(): boolean;
    reset(): void;
    private increaseImageName;
    private extendOptions;
    imageCropRect: IRectangle;
    blockOutAreas: IRectangle[];
    imageOutputLimit(): ImageOptions;
    thresholdType(): ImageOptions;
    threshold(thresholdType: any): 10 | 0.01;
    delta(): number;
    static cropImageDefault(_args: INsCapabilities): {
        x: number;
        y: any;
        width: any;
        height: any;
    };
    private static getOffsetPixels;
    private runDiff;
    compareImages(actual: string, expected: string, output: string, valueThreshold?: number, typeThreshold?: any): Promise<boolean>;
    clipRectangleImage(rect: IRectangle, path: string): Promise<{}>;
    readImage(path: string): Promise<any>;
}
