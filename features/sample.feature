Feature: Main Page
  As a user of the mobile application
  I should remove 1 by click

  Scenario: Number is set to 16
    Given I am on the main page
    Then I should see "16 taps left" inner "messageLabel"

  Scenario: Text after a click
    Given I am on the main page
    When I Select the button "tapButton"
    Then I should see "15 taps left" inner "messageLabel"
