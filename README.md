# nativescript-dev-cucumber

A helper package to make running E2E [Appium](http://appium.io) tests in NativeScript apps easier.

## Usage

Install it with:

`$ tns install cumcumber`

It will produce a sample test below the `features` dir. Now, run it with:

```
$ npm run cucumber-android
```

or

```
$ npm run cucumber-ios-simulator
```

The tests are standard [Cumcumber.js](https://cucumber.io/docs/reference/javascript) tests.

## Getting started

Create a new NativeScript Application (if necessary):

`$ tns create cucumberSample --ng`

Update the template to add "automationText" attributes (for Angular2 NS applications).

app.component.html:

```
<StackLayout>
    <Label text="Tap the button" class="title"></Label>
    
    <Button text="TAP" (tap)="onTap()" automationText="tapButton"></Button>

    <Label [text]="message" class="message" textWrap="true" automationText="messageLabel"></Label>
</StackLayout>
```

Install cucumber:

`$ tns install cucumber`

Execute tests:

```
$ npm run cucumber-android
```

or

```
$ npm run cucumber-ios-simulator
```
