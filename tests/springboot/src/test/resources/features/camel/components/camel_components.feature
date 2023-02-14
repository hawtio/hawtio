Feature: Checking the functionality of Camel Components page.

  @springBootCamelTest @springBootSmokeTest @springBootAllTest
  Scenario: Check that table of Attribute tab in Camel Components page is not empty
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Components folder of "SampleCamel" context
    When User clicks on Attributes tab of Camel Components page
    Then Camel Attributes table with "Context" column is presented
