export declare enum LogImageType {
    /**
     * Setting this property to add each image
     * during the image comparison into the report.
     * If not set, it will be logged only the last image comparison.
     */
    everyImage = "everyImage",
    /**
     * Setting this property to take screenshot on each hook
     * and add the images into the report.
     */
    screenshots = "screenshots"
}
