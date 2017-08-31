import { Point } from "./point";

export class UIElement {
    constructor(private _element: any, private _driver: any, private _webio: any, private _searchMethod: string, private _searchParams: string, private _index?: number) {
    }

    public async click() {
        return (await this.element()).click();
    }

    public async tap() {
        return (await this.element()).tap();
    }

    public async location() {
        const location = (await this.element()).getLocation();
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
        this.refetch();
        return await this._element;
    }

    public async isDisplayed() {
        return this.element() === null ? false : await this._element.isDisplayed();
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

    public async log() {
        console.dir(await this.element());
    }

    public async refetch() {
        try {
            if (this._index && this._index !== null) {
                this._element = (await this._driver[this._searchMethod](this._searchParams, 1000))[this._index];
            } else {
                this._element = await this._driver[this._searchMethod](this._searchParams, 1000);
            }
        } catch (error) {
            this._element = null;
        }

        return this._element;
    }
}
