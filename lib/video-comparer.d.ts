export declare class VideoComparer {
    private _videoFullName;
    private _videoComparer;
    constructor(_videoFullName: string);
    processVideo(): Promise<void>;
}
