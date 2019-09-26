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
    private _index?;
    private static readonly DEFAULT_REFETCH_TIME;
    constructor(_element: any, _driver: any, _wd: any, _webio: any, _args: INsCapabilities, _searchMethod: string, _searchParams: string, _index?: number);
    /**
     * Click on element
     */
    click(): Promise<any>;
    getCenter(): Promise<{
        x: number;
        y: number;
    }>;
    tapCenter(): Promise<void>;
    tapAtTheEnd(): Promise<void>;
    /**
     * @deprecated
     * Tap on element
     * This method is not working very good with UiAutomator2
     * It is better to use click instead.
     */
    tap(): Promise<any>;
    /**
     * @experimental
     * Double tap on element
     */
    doubleTap(): Promise<any>;
    longPress(duration: number): Promise<void>;
    /**
     * Get location of element
     */
    location(): Promise<Point>;
    /**
     * Get size of element
     */
    size(): Promise<{
        width: number;
        height: number;
    }>;
    /**
     * Get text of element
     */
    text(): Promise<any>;
    /**
    * Returns if an element is selected
    */
    isSelected(): Promise<any>;
    /**
     * Selected an element
     */
    select(retries?: number): Promise<any>;
    /**
     * Returns if an element is checked
     */
    isChecked(): Promise<boolean>;
    /**
     * Get web driver element
     */
    element(): Promise<any>;
    /**
     * Shows if element is displayed. Returns true or false. If the element doesn't exist it will return false
     */
    isDisplayed(): Promise<boolean>;
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
     * Scroll with offset from element with minimum inertia
     * @param direction
     * @param yOffset
     * @param xOffset
     */
    scroll(direction: Direction, yOffset?: number, xOffset?: number): Promise<void>;
    /**
     * Scroll with offset from element with minimum inertia
     * @param direction
     * @param yOffset
     * @param xOffset
     */
    scrollTo(direction: Direction, elementToSearch: () => Promise<UIElement>, yOffset?: number, xOffset?: number, retries?: number): Promise<UIElement>;
    /**
     * Click and hold over an element
     * @param time in milliseconds to increase the default press period.
     */
    hold(time?: number): Promise<void>;
    /**
     * Send keys to field or other UI component
     * @param text The string to input
     * @param shouldClearText Clears existing input before send new one - default value is 'true'
     * @param useAdb default value is false. Usable for Android ONLY !
     * Must be combined with '--relaxed-security' appium flag. When not running in sauceLabs '--ignoreDeviceController' should be added too.
     * @param adbDeleteCharsCount default value is 10. Usable for Android ONLY when 'useAdb' and 'shouldClearText' are True!
     */
    sendKeys(text: string, shouldClearText?: boolean, useAdb?: boolean, adbDeleteCharsCount?: number): Promise<void>;
    /**
    * Type text to field or other UI component
    * @param text
    * @param shouldClearText, default value is true
    */
    type(text: string, shouldClearText?: boolean): Promise<void>;
    /**
    * Send key code to device
    * @param key code
    */
    pressKeycode(keyCode: number): Promise<void>;
    /**
    * Clears text from ui element
    */
    clearText(): Promise<void>;
    /**
    * Clears text from ui element with ADB. Android ONLY !
    * Must be combined with '--relaxed-security' appium flag. When not running in sauceLabs '--ignoreDeviceController' should be added too.
    * @param charactersCount Characters count to delete. (Optional - default value 10)
    */
    adbDeleteText(charactersCount?: number): Promise<void>;
    log(): Promise<void>;
    refetch(): Promise<any>;
    /**
     * Easy to use in order to chain and search for nested elements
     */
    driver(): any;
    /**
    * Swipe element left/right
    * @param direction
    */
    swipe(direction: "up" | "down" | "left" | "right"): Promise<void>;
    /**
    * Drag element with specific offset
    * @experimental
    * @param direction
    * @param yOffset
    * @param xOffset - default value 0
    */
    drag(direction: Direction, yOffset: number, xOffset?: number): Promise<void>;
    /**
    *@experimental
    * Pan element with specific offset
    * @param points where the finger should move to.
    * @param initPointOffset element.getRectangle() is used as start point. In case some additional offset should be provided use this param.
    */
    pan(points: {
        x: number;
        y: number;
    }[], initPointOffset?: {
        x: number;
        y: number;
    }): Promise<void>;
    /**
     * @experimental
     * This method will try to move two fingers from opposite corners.
     * One finger starts from
     * { x: elementRect.x + offset.x, y: elementRect.y + offset.y }
     * and ends to
     * { x: elementRect.x + elementRect.width - offset.x, y: elementRect.height + elementRect.y - offset.y }
     * and the other finger starts from
     * { x: elementRect.width + elementRect.x - offset.x, y: elementRect.height + elementRect.y - offset.y }
     * and ends to
     * { x: elementRect.x + offset.x, y: elementRect.y + offset.y }
     */
    rotate(offset?: {
        x: number;
        y: number;
    }): Promise<void>;
    /**
     * @experimental
     * @param zoomFactory - zoomIn or zoomOut. Only zoomIn action is implemented
     * @param offset
     */
    pinch(zoomType: "in" | "out", offset?: {
        x: number;
        y: number;
    }): Promise<void>;
}
