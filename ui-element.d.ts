import { Point } from "./point";
export declare class UIElement {
    private element;
    constructor(element: any);
    click(): Promise<any>;
    tap(): Promise<any>;
    location(): Promise<Point>;
    size(): Promise<any>;
    text(): Promise<any>;
    driver(): Promise<any>;
    log(): Promise<void>;
    isDisplayed(): Promise<any>;
    getAttribute(attr: any): Promise<any>;
    isVisible(): Promise<void>;
}
