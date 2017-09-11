import * as blinkDiff from "blink-diff";

export enum ImageOptions {
    outputAll = blinkDiff.OUTPUT_ALL,
    pixel = blinkDiff.THRESHOLD_PIXEL,
    percent = blinkDiff.THRESHOLD_PERCENT,
}