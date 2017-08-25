import { Point } from "./point";

export class UIElement {
    private _args;
    constructor(private _element: any, private _driver: any, private _searchMethod: string, ...args) {
        this._args = args;
    }

    public async click() {
        return await this._element.click();
    }

    public async tap() {
        return await this._element.tap();
    }

    public async location() {
        const location = await this._element.getLocation();
        const point = new Point(location.x, location.y);
        return point;
    }

    public async size() {
        await this.refetch();
        return await this._element.size();
    }

    public async text() {
        await this.refetch();
        return await this._element.text();
    }

    public async element() {
        this.refetch();
        return await this._element;
    }

    public async log() {
        console.dir(await this.element());
    }

    public async isDisplayed() {
        if (this.element() === null) {
            return false;
        }
        return await this._element.isDisplayed();
    }

    public async exists() {
        await this.refetch();
        if (this.element() === null) {
            return false;
        }

        return true;
    }

    public async getAttribute(attr) {
        return await this._element.getAttribute(attr);
    }

    public async refetch() {
        try {
            this._element = await this._driver[this._searchMethod](this._args[0], 300);
        } catch (error) {
            this._element = null;
        }

        return this._element;
    }
}
