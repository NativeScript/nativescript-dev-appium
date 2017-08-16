import { Point } from "./point";

export class UIElement {
    constructor(private element: any) { }

    public async click() {
        return await this.element.click();
    }

    public async tap() {
        return await this.element.element.tap();
    }

    public async location() {
        const location = await this.element.element.getLocation();
        const point = new Point(location.x, location.y);
        return point;
    }

    public async size() {
        return await this.element.element.size();
    }

    public async text() {
        return await this.element.element.text();
    }

    public async driver() {
        return await this.element;
    }

    public async log() {
        console.log(await this.element.element);
    }

    public async isDisplayed() {
        return await this.element.element.isDisplayed();
    }

    public async getAttribute(attr) {
        return await this.element.element.getAttribute(attr);
    }

    public async isVisible(){
        
    }
}
