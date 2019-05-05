import { LogImageType } from "../enums/log-image-type";
/**
 * Provide report context to nativescript-dev-appium plugin
 * to add logs and images to the report
 * Supported reports: mochawesome
 */
export interface ITestReporter {
    /**
     * The name of reporter as mochawesome
     */
    name: string;
    /**
     * When we need to see all results from image comaprisson
     */
    logImageTypes: Array<LogImageType>;
    /**
     * Usually shouldbe set on each describe
     */
    context: any;
    /**
     * Method for logging
     */
    log: any;
    /**
     * Report drirecotry
     */
    reportDir: string;
}
