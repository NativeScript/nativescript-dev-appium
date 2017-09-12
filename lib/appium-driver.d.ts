export declare var should: any;
import { ElementHelper } from "./element-helper";
import { SearchOptions } from "./search-options";
import { UIElement } from "./ui-element";
import { SwipeDirection } from "./swipe-direction";
import { INsCapabilities } from "./ins-capabilities";
import { Point } from "./point";
export declare class AppiumDriver {
    private _driver;
    private _wd;
    private webio;
    private _driverConfig;
    private _args;
    private static defaultWaitTime;
    private static pngFileExt;
    private static partialUrl;
    private _elementHelper;
    private _storage;
    private _logPath;
    private _isAlive;
    private constructor();
    readonly capabilities: any;
    readonly platformName: any;
    readonly platformVesrion: any;
    readonly elementHelper: ElementHelper;
    readonly isAlive: boolean;
    readonly driver: any;
    wdio(): Promise<any>;
    wd(): Promise<any>;
    click(args: any): Promise<any>;
    navBack(): Promise<any>;
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
     * @param y
     * @param x
     * @param yOffset
     * @param duration
     * @param xOffset
     */
    scroll(direction: any, SwipeDirection: any, y: number, x: number, yOffset: number, xOffset?: number): Promise<void>;
    /**
     *
     * @param direction
     * @param SwipeDirection
     * @param element
     * @param startPoint
     * @param yOffset
     * @param xOffset
     * @param retryCount
     */
    scrollToElement(direction: SwipeDirection, element: any, startPoint: Point, yOffset: number, xOffset?: number, retryCount?: number): Promise<any>;
    /**
     * Swipe from point with offset and inertia according to duatio
     * @param y
     * @param x
     * @param yOffset
     * @param inertia
     * @param xOffset
     */
    swipe(y: number, x: number, yOffset: number, inertia?: number, xOffset?: number): Promise<void>;
    source(): Promise<any>;
    sessionId(): Promise<any>;
    compareScreen(imageName: string, timeOutSeconds: number, tollerance: number): Promise<boolean>;
    takeScreenshot(fileName: string): Promise<string>;
    logScreenshoot(fileName: string): Promise<string>;
    compareImages(expected: string, actual: string, output: string): Promise<boolean>;
    static createAppiumDriver(port: number, args: INsCapabilities): Promise<AppiumDriver>;
    inint(): Promise<void>;
    quit(): Promise<void>;
    private convertArrayToUIElements(array, searchM, args);
    private static configureLogging(driver, verbose);
}
