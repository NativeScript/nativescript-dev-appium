import { Point } from "./point";
import { Direction } from "./direction";
import { INsCapabilities } from "./interfaces/ns-capabilities";
import { AutomationName } from "./automation-name";
import { calculateOffset, adbShellCommand, logError } from "./utils";
import { AndroidKeyEvent } from "mobile-devices-controller";

export class UIElement {
    private static readonly DEFAULT_REFETCH_TIME = 1000;
    constructor(private _element: any,
        private _driver: any,
        private _wd: any,
        private _webio: any,
        private _args: INsCapabilities,
        private _searchMethod: string,
        private _searchParams: string,
        private _index?: number
    ) { }

    /**
     * Click on element
     */
    public async click() {
        return await (await this.element()).click();
    }

    public async tapCenter() {
        let action = new this._wd.TouchAction(this._driver);
        const rect = await this.getActualRectangle();
        this._args.testReporterLog(`Tap on center element ${{ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }}`);
        action
            .tap({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
        await action.perform();
        await this._driver.sleep(150);
    }

    public async tapAtTheEnd() {
        let action = new this._wd.TouchAction(this._driver);
        const rect = await this.getActualRectangle();
        action
            .tap({ x: (rect.x + rect.width) - 1, y: rect.y + rect.height / 2 });
        await action.perform();
        await this._driver.sleep(150);
    }

    /**
     * @deprecated
     * Tap on element
     * This method is not working very good with UiAutomator2
     * It is better to use click instead.
     */

    public async tap() {
        if (this._args.automationName == AutomationName.UiAutomator2) {
            return await this.tapCenter();
        } else {
            return await (await this.element()).tap();
        }
    }

    /**
     * Double tap on element
     */
    public async doubleTap() {
        return await this._driver.execute('mobile: doubleTap', { element: (await this.element()).value.ELEMENT });
    }

    /**
     * Get location of element
     */
    public async location() {
        const location = await (await this.element()).getLocation();
        const point = new Point(location.x, location.y);
        return point;
    }

    /**
     * Get size of element
     */
    public async size() {
        const size = await (await this.element()).getSize();
        const point = new Point(size.height, size.width);
        return point;
    }

    /**
     * Get text of element
     */
    public async text() {
        return await (await this.element()).text();
    }

    /**
    * Returns if an element is selected
    */
    public async isSelected() {
        const el = (await this.element());
        if (!el) return false;
        if (this._args.isAndroid) {
            try {
                await el.getAttribute("selected");
            } catch (error) {
                console.error("Check if this is the correct element!");
            }
        }

        try {
            return await el.isSelected();
        } catch (ex) {
            console.warn("'selected' attr is not reachable on this element!");
        }

        console.warn("Trying use 'value' attr!");
        try {
            const attrValue = await el.getAttribute("value");
            return attrValue === "1" || attrValue === "true" || attrValue === true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Selected an element
     */
    public async select(retries: number = 3) {
        (await (await this.element())).click();
        let el = (await this.element());
        if (!el) return el;

        let isSelected = await this.isSelected();
        while (retries >= 0 && !isSelected) {
            (await (await this.element())).click();
            isSelected = await this.isSelected();
            retries--;
            await this._driver.sleep(200);
        }

        return el;
    }

    /**
     * Returns if an element is checked
     */
    public async isChecked() {
        const el = (await this.element());
        if (!el) return false;
        if (this._args.isAndroid) {
            try {
                const isChecked = await el.getAttribute("checked");
                return isChecked === "true" || isChecked === true;
            } catch (error) {
                console.error("Check if this is the correct element!");
            }
        }

        console.warn("Trying use 'value' attr!");
        try {
            const attrValue = await el.getAttribute("value");
            return attrValue === "1" || attrValue === "true" || attrValue === true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get web driver element
     */
    public async element() {
        this._element = await this.refetch();
        return this._element;
    }

    /**
     * Shows if element is displayed. Returns true or false. If the element doesn't exist it will return false
     */
    public async isDisplayed() {
        try {
            const el = await this._element;
            let isDisplayed = true;
            if (!el || el === null) {
                return false;
            }
            const isDisplayedWebDriver = await el.isDisplayed();
            if (!isDisplayedWebDriver) {
                return false;
            }
            const displaySize = await this._driver.getWindowSize();
            const elemCoordinates = await el.getLocation();

            isDisplayed = isDisplayedWebDriver && elemCoordinates.x >= 0 && elemCoordinates.x < displaySize.width
                && elemCoordinates.y >= 0 && elemCoordinates.y < displaySize.height;

            return isDisplayed;
        } catch (error) {
            return false;
        }
    }

    /**
     * Returns true or false
     */
    public async exists() {
        return this.element() === null ? false : true;
    }

    /**
     * Waits until the element exists not.
     * @param wait 
     */
    public async waitForExistNot(wait: number = 3000) {
        return await this._webio.waitForExist(this._searchParams, wait, true);
    }

    /**
     * Wait until the elements appear
     * @param wait 
     */
    public async waitForExist(wait: number = 3000) {
        return this._webio.waitForExist(this._searchParams, wait, false);
    }

    /**
     * Get attribute of element
     * @param attr
     */
    public async getAttribute(attr) {
        return await (await this.element()).getAttribute(attr);
    }

    /**
     * Get rectangle of element
     */
    public async getRectangle() {
        const location = await this.location();
        const size = await this.size();
        const rect = { x: location.x, y: location.y, width: size.y, height: size.x };
        return rect;
    }

    /**
     * Get rectangle of element in actual dimensions
     */
    public async getActualRectangle() {
        const actRect = await this.getRectangle();
        const density = this._args.device.config.density;
        if (density) {
            actRect.x *= density;
            actRect.y *= density;
            actRect.width *= density;
            actRect.height *= density;
        } else {
            logError("Device's density is undefined!");
        }
        return actRect;
    }

    /**
     * Scroll with offset from element with minimum inertia
     * @param direction
     * @param yOffset 
     * @param xOffset 
     */
    public async scroll(direction: Direction, yOffset: number = 0, xOffset: number = 0) {
        //await this._driver.execute("mobile: scroll", [{direction: 'up'}])
        //await this._driver.execute('mobile: scroll', { direction: direction === 0 ? "down" : "up", element: this._element.ELEMENT });
        const location = await this.location();
        const size = await this.size();
        const x = location.x === 0 ? 10 : location.x;
        let y = (location.y + 15);
        if (yOffset === 0) {
            yOffset = location.y + size.y - 15;
        }

        if (direction === Direction.down) {
            y = (location.y + size.y) - 15;

            if (!this._webio.isIOS) {
                if (yOffset === 0) {
                    yOffset = location.y + size.y - 15;
                }
            }
        }
        if (direction === Direction.up) {
            if (yOffset === 0) {
                yOffset = size.y - 15;
            }
        }

        const endPoint = calculateOffset(direction, y, yOffset, x, xOffset, this._webio.isIOS, false);
        if (direction === Direction.down) {
            //endPoint.point.y += location.y;
        }
        let action = new this._wd.TouchAction(this._driver);
        action
            .press({ x: x, y: y })
            .wait(endPoint.duration)
            .moveTo({ x: endPoint.point.x, y: endPoint.point.y })
            .release();
        await action.perform();
        await this._driver.sleep(150);
    }


    /**
     * Scroll with offset from element with minimum inertia
     * @param direction
     * @param yOffset 
     * @param xOffset 
     */
    public async scrollTo(direction: Direction, elementToSearch: () => Promise<UIElement>, yOffset: number = 0, xOffset: number = 0, retries: number = 10) {
        //await this._driver.execute("mobile: scroll", [{direction: 'up'}])
        //await this._driver.execute('mobile: scroll', { direction: direction === 0 ? "down" : "up", element: this._element.ELEMENT });
        let el: UIElement = null;
        while (el === null && retries >= 0) {
            try {
                el = await elementToSearch();
                if (!el || el === null || !(await el.isDisplayed())) {
                    el = null;
                    await this.scroll(direction, yOffset, xOffset);
                }
            } catch (error) {
                await this.scroll(direction, yOffset, xOffset);
            }

            retries--;
        }
        return el;
    }

    /**
 * Drag element with specific offset
 * @param direction
 * @param yOffset 
 * @param xOffset - default value 0
 */
    public async drag(direction: Direction, yOffset: number, xOffset: number = 0) {
        const location = await this.location();

        const x = location.x === 0 ? 10 : location.x;
        const y = location.y === 0 ? 10 : location.y;

        const endPoint = calculateOffset(direction, y, yOffset, x, xOffset, this._webio.isIOS, false);

        if (this._args.isAndroid) {
            let action = new this._wd.TouchAction(this._driver);
            action
                .longPress({ x: x, y: y })
                .wait(endPoint.duration)
                .moveTo({ x: yOffset, y: yOffset })
                .release();
            await action.perform();
        } else {
            await this._wd.execute(`mobile: dragFromToForDuration`, {
                duration: endPoint.duration,
                fromX: x,
                fromY: y,
                toX: xOffset,
                toY: yOffset
            });
        }

        await this._driver.sleep(150);
    }

    /**
     * Click and hold over an element
     * @param time in milliseconds to increase the default press period.
     */
    public async hold(time?: number) {
        let action = new this._wd.TouchAction(this._driver);
        let durationTime = time ? time + 1000 : 1000;
        action
            .longPress({ el: await this.element(), duration: durationTime })
            .release();
        await action.perform();
        await this._driver.sleep(150);
    }

    /**
     * Send keys to field or other UI component
     * @param text
     * @param shouldClearText, default value is true
     * @param useAdb, default value is false. Usable for Android ONLY !
     */
    public async sendKeys(text: string, shouldClearText: boolean = true, useAdb: boolean = false) {
        if (useAdb && this._args.isAndroid) {
            if (shouldClearText) {
                await this.adbDeleteText();
            }
            await this.click();
            await adbShellCommand(this._driver, "input", ["text", text]);
        } else {
            if (shouldClearText) {
                await this.clearText();
            }
            await this._element.sendKeys(text);
        }
    }

    /**
    * Type text to field or other UI component
    * @param text
    * @param shouldClearText, default value is true
    */
    public async type(text: string, shouldClearText: boolean = true) {
        if (shouldClearText) {
            await this.clearText();
        }
        await this._element.type(text);
    }

    /**
    * Send key code to device
    * @param key code
    */
    public async pressKeycode(keyCode: number) {
        await this._driver.pressKeyCode(keyCode);
    }

    /**
    * Clears text from ui element
    */
    public async clearText() {
        await this.click();
        await this._element.clear();
    }

    /**
    * Clears text from ui element with ADB. Android ONLY !
    * @param charactersCount Characters count to delete. (Optional - default value 10)
    */
    public async adbDeleteText(charactersCount: number = 10) {
        await this.click();
        for (let index = 0; index < charactersCount; index++) {
            // Keyevent 67 Delete (backspace)
            await adbShellCommand(this._driver, "input", ["keyevent", AndroidKeyEvent.KEYCODE_DEL]);
        }
    }

    public async log() {
        const el = await this.element();
        console.dir(el);
        this._args.testReporterLog(el);
    }

    public async refetch() {
        try {
            if (this._index != null) {
                return (await this._driver[this._searchMethod](this._searchParams, UIElement.DEFAULT_REFETCH_TIME))[this._index];
            } else {
                return await this._driver[this._searchMethod](this._searchParams, UIElement.DEFAULT_REFETCH_TIME);
            }
        } catch (error) {
            console.log("Refetch error: " + error);
            return null;
        }
    }

    /**
     * Easy to use in order to chain and search for nested elements
     */
    public driver(): any {
        return this._element.browser;
    }

    /**
    * Swipe element left/right
    * @param direction
    */
    public async swipe(direction: Direction) {
        const rectangle = await this.getRectangle();
        const centerX = rectangle.x + rectangle.width / 2;
        const centerY = rectangle.y + rectangle.height / 2;
        let swipeX;
        if (direction == Direction.right) {
            const windowSize = await this._driver.getWindowSize();
            swipeX = windowSize.width - 10;
        } else if (direction == Direction.left) {
            swipeX = 10;
        } else {
            console.log("Provided direction must be left or right !");
        }

        if (this._args.isAndroid) {
            const action = new this._wd.TouchAction(this._driver);
            action.press({ x: centerX, y: centerY })
                .wait(200)
                .moveTo({ x: swipeX, y: centerY })
                .release();
            await action.perform();
        }
        else {
            await this._driver.execute('mobile: dragFromToForDuration', {
                duration: 2.0,
                fromX: centerX,
                fromY: centerY,
                toX: swipeX,
                toY: centerY
            });
        }
    }
}
