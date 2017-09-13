import { INsCapabilities } from "./ins-capabilities";

export class Locator {

    private _elementsList: Map<string, string>;

    constructor(private _platformName: string, private _platformVersion) {
        this._elementsList = new Map<string, string>();
        if (this._platformName.toLowerCase().includes("android")) {
            this.loadAndroidElements();
        }else{
            this.loadIOSElements();
        }
    }

    get button() {
        return this.getElementByName("button");
    }

    get listView() {
        return this.getElementByName("listview");
    }

    get allELementsList() {
        return this._elementsList;
    }

    public getElementByName(name): string {
        if (!this._elementsList.has(name)) {
            throw new Error("This " + name + " does not appear to to be a standard NativeScript UI component.");
        }

        return this._elementsList.get(name);
    }

    private loadAndroidElements() {
        this._elementsList.set("activityindicator", "android.widget.ProgressBar");
        this._elementsList.set("button", "android.widget.Button");
        this._elementsList.set("image", "org.nativescript.widgets.ImageView");
        this._elementsList.set("image-button", "android.widget.ImageButton");
        this._elementsList.set("imagebutton", "android.widget.ImageButton");
        this._elementsList.set("datepicker", "android.widget.DatePicker");
        this._elementsList.set("htmlview", "android.widget.TextView");
        this._elementsList.set("label", "android.widget.TextView");
        this._elementsList.set("absolutelayout", "android.view.View");
        this._elementsList.set("docklayout", "android.view.View");
        this._elementsList.set("stacklayout", "android.view.View");
        this._elementsList.set("wraplayout", "android.view.View");
        this._elementsList.set("scrollview", "android.view.View");
        this._elementsList.set("hscrollview", "org.nativescript.widgets.HorizontalScrollView");
        this._elementsList.set("vscrollview", "org.nativescript.widgets.VerticalScrollView");
        this._elementsList.set("listpicker", "android.widget.NumberPicker");
        this._elementsList.set("listview", "android.widget.ListView");
        this._elementsList.set("progress", "android.widget.ProgressBar");
        this._elementsList.set("searchbar", "android.widget.SearchView");
        this._elementsList.set("segmentedbar", "android.widget.TabHost");
        this._elementsList.set("slider", "android.widget.SeekBar");
        this._elementsList.set("switch", "android.widget.Switch");
        this._elementsList.set("tabview", "android.support.v4.view.ViewPager");
        this._elementsList.set("switch", "android.widget.Switch");
        this._elementsList.set("tabview", "android.support.v4.view.ViewPager");
        this._elementsList.set("textview", "android.widget.EditText");
        this._elementsList.set("securetextfield", "android.widget.EditText");
        this._elementsList.set("textfield", "android.widget.EditText");
        this._elementsList.set("timepicker", "android.widget.TimePicker");
        this._elementsList.set("webview", "android.widget.WebView");
    }

    private loadIOSElements() {
        this._elementsList.set("activityindicator", this.createIosElement("ActivityIndicator"));
        this._elementsList.set("button", this.createIosElement("Button"));
        this._elementsList.set("image-button", this.createIosElement("Button"));
        this._elementsList.set("imagebutton", this.createIosElement("Button"));
        this._elementsList.set("datepicker", this.createIosElement("DatePicker"));
        this._elementsList.set("htmlview", this.createIosElement("TextView"));
        this._elementsList.set("image", this.createIosElement("ImageView"));
        this._elementsList.set("label", this.createIosElement("StaticText"));
        this._elementsList.set("absolutelayout", this.createIosElement("View"));
        this._elementsList.set("docklayout", this.createIosElement("View"));
        this._elementsList.set("gridlayout", this.createIosElement("View"));
        this._elementsList.set("wraplayout", this.createIosElement("View"));
        this._elementsList.set("listpicker", this.createIosElement("Picker"));
        this._elementsList.set("listview", this.createIosElement("Table"));
        this._elementsList.set("progress", this.createIosElement("ProgressIndicator"));
        this._elementsList.set("scrollview", this.createIosElement("ScrollView"));
        this._elementsList.set("hscrollview", this.createIosElement("ScrollView"));
        this._elementsList.set("vscrollview", this.createIosElement("ScrollView"));
        this._elementsList.set("searchbar", this.createIosElement("SearchField"));
        this._elementsList.set("segmentedbar", this.createIosElement("SegmentedControl"));
        this._elementsList.set("slider", this.createIosElement("Slider"));
        this._elementsList.set("switch", this.createIosElement("Switch"));
        this._elementsList.set("tabview", "XCUIElementTypeTabBarItem");
        this._elementsList.set("textview", this.createIosElement("TextView"));
        this._elementsList.set("textfield", this.createIosElement("TextField"));
        this._elementsList.set("securetextfield", this.createIosElement("SecureTextField"));
        this._elementsList.set("textfield", this.createIosElement("TextField"));
        this._elementsList.set("timepicker", this.createIosElement("DatePicker"));
        this._elementsList.set("webview", this.createIosElement("WebView"));
    }

    private createIosElement(element) {
        let elementType = "UIA";
        if (parseFloat(this._platformVersion) >= 10) {
            elementType = "XCUIElementType";
        }

        return elementType + element;
    }
}