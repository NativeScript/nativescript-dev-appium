import { Point } from "./point";
import { SwipeDirection } from "./swipe-direction";

export class UIElement {
    constructor(private _element: any, private _driver: any, private _wd: any, private _webio: any, private _searchMethod: string, private _searchParams: string, private _index?: number) {
    }

    public async click() {
        return await (await this.element()).click();
    }

    public async tap() {
        return await (await this.element()).tap();
    }

    public async doubleTap() {
        return await this._driver.execute('mobile: doubleTap', { element: (await this.element()).value.ELEMENT });
    }

    public async location() {
        const location = await (await this.element()).getLocation();
        const point = new Point(location.x, location.y);
        return point;
    }

    public async size() {
        return await (await this.element()).size();
    }

    public async text() {
        return await (await this.element()).text();
    }

    public async element() {
        this._element = await this.refetch();
        return await this._element;
    }

    public async isDisplayed() {
        const el = (await this.element());
        return (await el) === null ? false : (await this._element.isDisplayed());
    }

    public async exists() {
        return this.element() === null ? false : true;
    }

    public async waitForExistNot(wait: number = 3000) {
        return await this._webio.waitForExist(this._searchParams, wait, true);
    }

    public async waitForExist(wait: number = 3000) {
        return this._webio.waitForExist(this._searchParams, wait, false);
    }

    public async getAttribute(attr) {
        return await (await this.element()).getAttribute(attr);
    }

    public async scroll(direction: SwipeDirection, yOffset: number, xOffset: number = 0) {
        //await this._driver.execute("mobile: scroll", [{direction: 'up'}])
        //await this._driver.execute('mobile: scroll', { direction: direction === 0 ? "down" : "up", element: this._element.ELEMENT });

        if (this._webio.isIOS) {
            direction = direction === SwipeDirection.down ? -1 : 1;
        } else {
            direction = direction === SwipeDirection.down ? 1 : -1;
        }
        const location = await this.location();

        const x = location.x + 5;
        const y = location.y + 5;
        const yEnd = direction * yOffset;
        const duration = (y - yEnd) * 10;
        let action = new this._wd.TouchAction(this._driver);
        action
            .press({ x: x, y: y })
            .wait(duration)
            .moveTo({ x: xOffset, y: yEnd })
            .release();
        await action.perform();
        await this._driver.sleep(3000);
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
