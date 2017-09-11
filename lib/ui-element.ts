import { Point } from "./point";
import { SwipeDirection } from "./swipe-direction";
import { calculateOffset } from "./utils";

export class UIElement {
    constructor(private _element: any, private _driver: any, private _wd: any, private _webio: any, private _searchMethod: string, private _searchParams: string, private _index?: number) {
    }

    /**
     * Click on element
     */
    public async click() {
        return await (await this.element()).click();
    }

    /**
     * Tap on element
     */
    public async tap() {
        return await (await this.element()).tap();
    }

    /**
     * double tap
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
        return await (await this.element()).size();
    }

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
        return (await el) === null ? false : (await this._element.isDisplayed());
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

    public async getAttribute(attr) {
        return await (await this.element()).getAttribute(attr);
    }

    /**
     * Scroll with offset from elemnt with minimum inertia
     * @param direction
     * @param yOffset 
     * @param xOffset 
     */
    public async scroll(direction: SwipeDirection, yOffset: number, xOffset: number = 0) {
        //await this._driver.execute("mobile: scroll", [{direction: 'up'}])
        //await this._driver.execute('mobile: scroll', { direction: direction === 0 ? "down" : "up", element: this._element.ELEMENT });
        const location = await this.location();

        const x = location.x === 0 ? 10 : location.x;
        const y = location.y === 0 ? 15 : location.y;
        const endPoint = calculateOffset(direction, y, yOffset, x, xOffset, this._webio.isIOS);

        let action = new this._wd.TouchAction(this._driver);
        action
            .press({ x: x, y: y })
            .wait(endPoint.duration)
            .moveTo({ x: endPoint.point.x, y: endPoint.point.y })
            .release();
        await action.perform();
        await this._driver.sleep(150);
    }

    public async log() {
        console.dir(await this.element());
    }

    public async refetch() {
        try {
            if (this._index && this._index !== null) {
                return (await this._driver[this._searchMethod](this._searchParams, 1000))[this._index];
            } else {
                return await this._driver[this._searchMethod](this._searchParams, 1000);
            }
        } catch (error) {
            return null;
        }
    }
}
