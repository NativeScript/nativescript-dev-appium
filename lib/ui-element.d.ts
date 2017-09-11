import { Point } from "./point";
import { SwipeDirection } from "./swipe-direction";
export declare class UIElement {
    private _element;
    private _driver;
    private _wd;
    private _webio;
    private _searchMethod;
    private _searchParams;
    private _index;
    constructor(_element: any, _driver: any, _wd: any, _webio: any, _searchMethod: string, _searchParams: string, _index?: number);
    /**
     * Click on element
     */
    click(): Promise<any>;
    /**
     * Tap on element
     */
    tap(): Promise<any>;
    /**
     * double tap
     */
    doubleTap(): Promise<any>;
    /**
     * Get location of element
     */
    location(): Promise<Point>;
    /**
     * Get size of element
     */
    size(): Promise<any>;
    text(): Promise<any>;
    /**
     * Get web driver element
     */
    element(): Promise<any>;
    /**
     * Shows if element is displayed. Returns true or false. If the element doesn't exist it will return false
     */
    isDisplayed(): Promise<any>;
    /**
     * Returns true or false
     */
    exists(): Promise<boolean>;
    /**
     * Waits until the element exists not.
     * @param wait
     */
    waitForExistNot(wait?: number): Promise<any>;
    /**
     * Wait until the elements appear
     * @param wait
     */
    waitForExist(wait?: number): Promise<any>;
    getAttribute(attr: any): Promise<any>;
    /**
     * Scroll with offset from elemnt with minimum inertia
     * @param direction
     * @param yOffset
     * @param xOffset
     */
    scroll(direction: SwipeDirection, yOffset: number, xOffset?: number): Promise<void>;
    log(): Promise<void>;
    refetch(): Promise<any>;
}
