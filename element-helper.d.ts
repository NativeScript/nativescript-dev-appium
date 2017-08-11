export declare class ElementHelper {
    private platform;
    private platformVersion;
    constructor(platform: string, platformVersion: number);
    getXPathElement(name: any): string;
    getElementClass(name: any): string;
    getXPathByText(text: any, exactMatch: any): string;
    getXPathWithExactText(text: any): string;
    getXPathContainingText(text: any): string;
    findByTextLocator(controlType: any, value: any, exactMatch: any): string;
    getAndroidClass(name: any): "android.widget.ProgressBar" | "android.widget.Button" | "android.widget.DatePicker" | "android.widget.TextView" | "org.nativescript.widgets.ImageView" | "android.view.View" | "android.widget.NumberPicker" | "android.widget.ListView" | "org.nativescript.widgets.HorizontalScrollView" | "org.nativescript.widgets.VerticalScrollView" | "android.widget.SearchView" | "android.widget.TabHost" | "android.widget.SeekBar" | "android.widget.Switch" | "android.support.v4.view.ViewPager" | "android.widget.EditText" | "android.widget.TimePicker" | "android.webkit.WebView";
    private getiOSClassByName(name, caps);
    private createIosElement(element);
}
