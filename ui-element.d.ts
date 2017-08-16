export declare class UIElement {
    private element;
    constructor(element: any);
    click(): Promise<any>;
    tap(): Promise<any>;
    location(): Promise<any>;
    size(): Promise<any>;
    text(): Promise<any>;
    driver(): Promise<any>;
    log(): Promise<any>;
}
