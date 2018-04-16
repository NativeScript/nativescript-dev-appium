export declare var should: any;
import { ElementHelper } from "./element-helper";
import { SearchOptions } from "./search-options";
import { UIElement } from "./ui-element";
import { Direction } from "./direction";
import { Locator } from "./locators";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { IRectangle } from "./interfaces/rectangle";
import { Point } from "./point";
import { ImageHelper } from "./image-helper";
import { ImageOptions } from "./image-options";
export declare class AppiumDriver {
    private _driver;
    private _wd;
    private _webio;
    private _driverConfig;
    private _args;
    private static pngFileExt;
    private static partialUrl;
    private _defaultWaitTime;
    private _elementHelper;
    private _imageHelper;
    private _isAlive;
    private _locators;
    private _logPath;
    private _storageByDeviceName;
    private _storageByPlatform;
    private constructor();
    readonly imageHelper: ImageHelper;
    defaultWaitTime: number;
    readonly capabilities: any;
    readonly nsCapabilities: INsCapabilities;
    readonly platformName: any;
    readonly platformVersion: any;
    readonly elementHelper: ElementHelper;
    readonly locators: Locator;
    readonly isAlive: boolean;
    readonly isAndroid: boolean;
    readonly isIOS: boolean;
    readonly driver: any;
    webio(): any;
    wd(): any;
    click(args: any): Promise<any>;
    navBack(): Promise<any>;
    /**
    * Get the storage where test results from image comparisson is logged It will be reports/app nam/device name
    */
    readonly reportsPath: string;
    /**
    * Get the storage where images are captured by platform. It will be resources/app nam/platform name
    */
    readonly storageByPlatform: string;
    /**
     * Get the storage where images are captured. It will be resources/app nam/device name
     */
    readonly storageByDeviceName: string;
    static createAppiumDriver(port: number, args: INsCapabilities): Promise<AppiumDriver>;
    /**
     *
     * @param xPath
     * @param waitForElement
     */
    findElementByXPath(xPath: string, waitForElement?: number): Promise<UIElement>;
    /**
     *
     * @param xPath
     * @param waitForElement
     */
    findElementsByXPath(xPath: string, waitForElement?: number): Promise<UIElement[]>;
    /**
     * Search for element by given text. The seacrch is case insensitive for android
     * @param text
     * @param match
     * @param waitForElement
     */
    findElementByText(text: string, match?: SearchOptions, waitForElement?: number): Promise<UIElement>;
    /**
     * Search for elements by given text. The seacrch is case insensitive for android
     * @param text
     * @param match
     * @param waitForElement
     */
    findElementsByText(text: string, match?: SearchOptions, waitForElement?: number): Promise<UIElement[]>;
    /**
     * Searches for element by element native class name like button, textView etc which will be translated to android.widgets.Button or XCUIElementTypeButton (iOS 10 and higher) or UIElementButton (iOS 9)
     * Notice this is not the same as css class
     * @param className
     * @param waitForElement
     */
    findElementByClassName(className: string, waitForElement?: number): Promise<UIElement>;
    /**
     * Searches for element by element native class name like button, textView etc which will be translated to android.widgets.Button or XCUIElementTypeButton (iOS 10 and higher) or UIElementButton (iOS 9)
     * Notice this is not the same as css class
     * @param className
     * @param waitForElement
     */
    findElementsByClassName(className: string, waitForElement?: number): Promise<UIElement[]>;
    /**
     * Find element by automationText
     * @param id
     * @param waitForElement
     */
    findElementByAccessibilityId(id: any, waitForElement?: number): Promise<UIElement>;
    /**
     * Find elements by automationText
     * @param id
     * @param waitForElement
     */
    findElementsByAccessibilityId(id: string, waitForElement?: number): Promise<UIElement[]>;
    /**
     * Scrolls from point to other point with minimum inertia
     * @param direction
     * @param y
     * @param x
     * @param yOffset
     * @param xOffset
     */
    scroll(direction: Direction, y: number, x: number, yOffset: number, xOffset?: number): Promise<void>;
    /**
     *
     * @param direction
     * @param element
     * @param startPoint
     * @param yOffset
     * @param xOffset
     * @param retryCount
     */
    scrollTo(direction: Direction, element: any, startPoint: Point, yOffset: number, xOffset?: number, retryCount?: number): Promise<any>;
    /**
     * Swipe from point with offset and inertia according to duatio
     * @param y
     * @param x
     * @param yOffset
     * @param inertia
     * @param xOffset
     */
    swipe(y: number, x: number, yOffset: number, inertia?: number, xOffset?: number): Promise<void>;
    /**
    * Click a point by providing coordinates
    * @param x
    * @param y
    */
    clickPoint(xCoordinate: number, yCoordinate: number): Promise<void>;
    source(): Promise<any>;
    sessionId(): Promise<any>;
    compareElement(element: UIElement, imageName: string, tolerance?: number, timeOutSeconds?: number, toleranceType?: ImageOptions): Promise<boolean>;
    compareRectangle(rect: IRectangle, imageName: string, timeOutSeconds?: number, tolerance?: number, toleranceType?: ImageOptions): Promise<boolean>;
    compareScreen(imageName: string, timeOutSeconds?: number, tolerance?: number, toleranceType?: ImageOptions): Promise<boolean>;
    /**
     * @param videoName
     * @param callback when to stop video recording. In order an element is found. Should return true to exit
     */
    recordVideo(videoName: any, callback: () => Promise<any>): Promise<any>;
    private _recordVideoInfo;
    /**
     * @param videoName
     */
    startRecordingVideo(videoName: any): any;
    stopRecordingVideo(): Promise<any>;
    private compare(imageName, timeOutSeconds?, tolerance?, rect?, toleranceType?);
    prepareImageToCompare(filePath: string, rect: IRectangle): Promise<void>;
    takeScreenshot(fileName: string): Promise<string>;
    logScreenshot(fileName: string): Promise<string>;
    logPageSource(fileName: string): Promise<void>;
    /**
     * Send the currently active app to the background
     * @param time
     */
    backgroundApp(time: number): Promise<void>;
    resetApp(): Promise<void>;
    init(): Promise<void>;
    quit(): Promise<void>;
    private static applyAdditionalSettings(args);
    private convertArrayToUIElements(array, searchM, args);
    private static configureLogging(driver, verbose);
    private getExpectedImagePath(imageName);
    /**
    * Wait specific amount of time before continue execution
    * @param miliseconds
    */
    sleep(miliseconds: number): Promise<void>;
    /**
  * Wait specific amount of time before continue execution
  * @param miliseconds
  */
    wait(miliseconds: number): void;
    /**
    * Search for element by given xPath but does not throw error if can not find it. Instead returns 'undefined'.
    * @param xPath
    * @param waitForElement
    */
    findElementByXPathIfExists(xPath: string, waitForElement?: number): Promise<UIElement>;
    /**
    * Search for element by given text but does not throw error if can not find it. Instead returns 'undefined'.
    * @param text
    * @param match
    * @param waitForElement
    */
    findElementByTextIfExists(text: string, match?: SearchOptions, waitForElement?: number): Promise<UIElement>;
    /**
    * Search for element by automationText but does not throw error if can not find it. Instead returns 'undefined'.
    * @param id
    * @param waitForElement
    */
    findElementByAccessibilityIdIfExists(id: string, waitForElement?: number): Promise<UIElement>;
    setDontKeepActivities(value: boolean): Promise<void>;
}
