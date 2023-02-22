Feature: Checking the functionality of Camel Routes page.

  @springBootCamelTest @springBootAllTest
  Scenario: Check that table of Attribute tab in Camel Routes page is not empty
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Routes folder of "SampleCamel" context
    When User clicks on Routes tab of Camel Routes page
    Then Camel Routes table is presented

  @springBootCamelTest @springBootAllTest
  Scenario: Check the stop operation on Camel Route
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Routes folder of "SampleCamel" context
    And User selects "cron" route from the table
    When The "cron" route is in "Stop" state
    Then The "cron" route should have "Stopped" state

  @springBootCamelTest @springBootAllTest
  Scenario: Check the start operation on Camel Route
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Routes folder of "SampleCamel" context
    And User selects "cron" route from the table
    When The "cron" route is in "Start" state
    Then The "cron" route should have "Started" state
    And The delete button should be disabled

  @springBootCamelTest @springBootAllTest
  Scenario: Check the delete operation on Camel Route
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Routes folder of "SampleCamel" context
    And User selects "cron" route from the table
    And The "cron" route is in "Stop" state
    When User clicks on Delete button in dropdown in routes table
    And User confirms deletion on Camel Routes page
    Then The "cron" route should not be in the table anymore

  @springBootCamelTest @springBootAllTest
  Scenario: Check, that diagram of Route Diagram tab in Camel Routes is presented
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Routes folder of "SampleCamel" context
    When User clicks on Route Diagram tab of Camel Routes page
    Then Camel Route diagram is presented
