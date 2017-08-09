
/**
 * Starts an appium server on the specified port.
 * @param port Port. If ommited the default 9200 will be used.
 */
export function startAppiumServer(port?: number): void;

/**
 * Kills the appium server started with startAppiumServer.
 */
export function killAppiumServer(): void;

/**
 * returns xpath
 */
export function getXPathWithExactText(text: string): string;

/**
 * returns xpath
 */
export function getXPathContainingsText(text: string): string;


/**
 * Creates appium driver. 
 * @param capabilities 
 * @param activityName Default is com.tns.NativeScriptActivity
 * 
 */
export function createDriver(capabilities?: any, activityName?: string): string;
