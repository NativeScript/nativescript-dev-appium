module.exports = function () {
  this.Given(/^I am on the main page$/, function (callback) {
    this.driver
      .elementByAccessibilityId('tapButton')
      .should.eventually.exist
      .and.notify(callback);
  });

  this.When(/^I Select the button "(.*)"$/, function (button, callback) {
    this.driver
      .elementByAccessibilityId(button)
      .should.eventually.exist
      .tap()
      .should.eventually.notify(callback);
  });

  this.Then(/^I should see "(.*)" inner "(.*)"$/, function (text, element, callback) {
    this.driver
      .elementByAccessibilityId(element)
      .text().should.eventually.equal(text)
      .and.notify(callback);
  });
};