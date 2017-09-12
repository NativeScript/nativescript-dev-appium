export class Point {
    constructor(private _x: number, private _y: number) {
    }

    get x() {
        return this._x;
    }

    set x(x) {
        this._x = x;
    }

    get y() {
        return this._y;
    }

    set y(y) {
        this._y = y;
    }

    public toString() {
        return `${this.x} ${this.y}`;
    }
}