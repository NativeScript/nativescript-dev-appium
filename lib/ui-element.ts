import { Point } from "./point";
import { Direction } from "./direction";
import { INsCapabilities, AutomationName } from "./interfaces/ns-capabilities";
import { IRectangle } from "./interfaces/rectangle";
import { calculateOffset } from "./utils";

export class UIElement {
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

    /**
    * Click a point by providing coordinates
    * @param x
    * @param y
    */
    public async tapCenter() {
        let action = new this._wd.TouchAction(this._driver);
        const rect = await this.getActualRectangle();
        action
            .tap({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
        await action.perform();
        await this._driver.sleep(150);
    }

    /**
     * Tap on element
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
     * Get web driver element
     */
    public async element() {
        this._element = await this.refetch();
        return await this._element;
    }

    /**
     * Shows if element is displayed. Returns true or false. If the element doesn't exist it will return false
     */
    public async isDisplayed() {
        const el = (await this.element());
        return (await el) === null ? false : (await el.isDisplayed());
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
        if (this._args.isIOS) {
            const density = this._args.device.config.density;
            if (density) {
                actRect.x *= density;
                actRect.y *= density;
                actRect.width *= density;
                actRect.height *= density;
            } else {
                throw new Error("Device's density is undefined!");
            }
        }
        return actRect;
    }

    /**
     * Scroll with offset from elemnt with minimum inertia
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
            endPoint.point.y += location.y;
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
     * Scroll with offset from elemnt with minimum inertia
     * @param direction
     * @param yOffset 
     * @param xOffset 
     */
    public async scrollTo(direction: Direction, elementToSearch, yOffset: number = 0, xOffset: number = 0) {
        //await this._driver.execute("mobile: scroll", [{direction: 'up'}])
        //await this._driver.execute('mobile: scroll', { direction: direction === 0 ? "down" : "up", element: this._element.ELEMENT });
        let el: UIElement = null;
        let retries = 7;
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
 * Scroll with offset from elemnt with minimum inertia
 * @param direction
 * @param yOffset 
 * @param xOffset 
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
     */
    public async hold() {
        let action = new this._wd.TouchAction(this._driver);
        action
            .longPress({ el: await this.element() })
            .release();
        await action.perform();
        await this._driver.sleep(150);
    }

    /**
     * Send keys to field or other UI component
     * @param text
     */
    public async sendKeys(text: string) {
        await this._element.sendKeys(text);
    }

    public async log() {
        console.dir(await this.element());
    }

    public async refetch() {
        try {
            if (this._index != null) {
                return (await this._driver[this._searchMethod](this._searchParams, 1000))[this._index];
            } else {
                return await this._driver[this._searchMethod](this._searchParams, 1000);
            }
        } catch (error) {
            return null;
        }
    }
}
