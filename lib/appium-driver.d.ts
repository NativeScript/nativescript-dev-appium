export declare const should: any;
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
import { LogType } from "./log-types";
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
    storageByDeviceName: string;
    readonly storage: string;
    /**
     * Returns instance of wd.TouchAction object
     */
    readonly touchAction: any;
    webio(): any;
    wd(): any;
    click(args: any): Promise<any>;
    navBack(): Promise<any>;
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
     * Search for element by given text. The search is case insensitive for android
     * @param text
     * @param match
     * @param waitForElement
     */
    findElementByText(text: string, match?: SearchOptions, waitForElement?: number): Promise<UIElement>;
    /**
     * Search for element by given automationText. Searches only for exact string.
     * @param text
     * @param waitForElement
     */
    findElementByAutomationText(automationText: string, waitForElement?: number): Promise<UIElement>;
    /**
     * Search for element by given automationText and waits until the element is displayed.
     * @param text
     * @param waitInMilliseconds till element is displayed
     */
    waitForElement(automationText: string, waitInMilliseconds?: number): Promise<UIElement>;
    /**
     * Search for elements by given automationText. Searches only for exact string. Returns promise with array of elements.
     * @param text
     * @param waitForElement
     */
    findElementsByAutomationText(automationText: string, waitForElement?: number): Promise<UIElement[]>;
    /**
     * Search for elements by given text. The search is case insensitive for android
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
    private compare;
    prepareImageToCompare(filePath: string, rect: IRectangle): Promise<void>;
    takeScreenshot(fileName: string): Promise<string>;
    logScreenshot(fileName: string): Promise<string>;
    getlog(logType: LogType): Promise<any>;
    logPageSource(fileName: string): Promise<void>;
    logDeviceLog(fileName: any, logType: LogType, filter?: string): Promise<void>;
    /**
     * This method will snapshot the screen of device, get page source and log from device
     * @param logName
     */
    logTestArtifacts(logName: string): Promise<void>;
    /**
     * Send the currently active app to the background
     * @param time in minutes
     */
    backgroundApp(minutes: number): Promise<void>;
    resetApp(): Promise<void>;
    init(): Promise<void>;
    quit(): Promise<void>;
    private static applyAdditionalSettings;
    private convertArrayToUIElements;
    private static configureLogging;
    private getExpectedImagePath;
    /**
    * Wait specific amount of time before continue execution
    * @param milliseconds
    */
    sleep(milliseconds: number): Promise<void>;
    /**
  * Wait specific amount of time before continue execution
  * @param milliseconds
  */
    wait(milliseconds: number): void;
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
    findElementByAccessibilityIdIfExists(id: string, waitForElement?: number): Promise<any>;
    setDontKeepActivities(value: boolean): Promise<void>;
    /**
     *  Experimental feature that is still tricky to use!!!
     *  Find location on the screen by provided image.
     * @param image The name of the image without the extension.
     * @param imageThreshold The degree of match for current search, on the scale between 0 and 1. Default 0.4
     */
    findElementByImage(image: string, imageThreshold?: number): Promise<UIElement>;
}
