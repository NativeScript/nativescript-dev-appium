import { Point } from "./point";
export declare class UIElement {
    private _element;
    private _driver;
    private _searchMethod;
    private _args;
    constructor(_element: any, _driver: any, _searchMethod: string, ...args: any[]);
    click(): Promise<any>;
    tap(): Promise<any>;
    location(): Promise<Point>;
    size(): Promise<any>;
    text(): Promise<any>;
    driver(): Promise<any>;
    log(): Promise<void>;
    isDisplayed(): Promise<any>;
    exists(): Promise<boolean>;
    getAttribute(attr: any): Promise<any>;
    refetch(): Promise<any>;
}
