import { Point } from "./point";
import { Direction } from "./direction";
import { INsCapabilities } from "./interfaces/ns-capabilities";
export declare class UIElement {
    private _element;
    private _driver;
    private _wd;
    private _webio;
    private _args;
    private _searchMethod;
    private _searchParams;
    private _index;
    constructor(_element: any, _driver: any, _wd: any, _webio: any, _args: INsCapabilities, _searchMethod: string, _searchParams: string, _index?: number);
    /**
     * Click on element
     */
    click(): Promise<any>;
    /**
     * Tap on element
     */
    tap(): Promise<any>;
    /**
     * Double tap on element
     */
    doubleTap(): Promise<any>;
    /**
     * Get location of element
     */
    location(): Promise<Point>;
    /**
     * Get size of element
     */
    size(): Promise<Point>;
    /**
     * Get text of element
     */
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
    /**
     * Get attribute of element
     * @param attr
     */
    getAttribute(attr: any): Promise<any>;
    /**
     * Get rectangle of element
     */
    getRectangle(): Promise<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
    /**
     * Get rectangle of element in actual dimensions
     */
    getActualRectangle(): Promise<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
    /**
     * Scroll with offset from elemnt with minimum inertia
     * @param direction
     * @param yOffset
     * @param xOffset
     */
    scroll(direction: Direction, yOffset?: number, xOffset?: number): Promise<void>;
    /**
     * Scroll with offset from elemnt with minimum inertia
     * @param direction
     * @param yOffset
     * @param xOffset
     */
    scrollTo(direction: Direction, elementToSearch: any, yOffset?: number, xOffset?: number): Promise<UIElement>;
    /**
 * Scroll with offset from elemnt with minimum inertia
 * @param direction
 * @param yOffset
 * @param xOffset
 */
    drag(direction: Direction, yOffset: number, xOffset?: number): Promise<void>;
    /**
     * Click and hold over an element
     */
    hold(): Promise<void>;
    /**
     * Send keys to field or other UI component
     * @param text
     */
    sendKeys(text: string): Promise<void>;
    log(): Promise<void>;
    refetch(): Promise<any>;
}
