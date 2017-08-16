export class UIElement {
    constructor(private element: any) { }

    public async click() {
        return await this.element.click();
    }

    public async tap() {
        return await this.element.element.tap();
    }

    public async location() {
        return await this.element.element.getLocation();
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
        return await this.element.element;
    }
}
