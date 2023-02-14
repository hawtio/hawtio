Feature: Checking the changes of states after performing some operation on Camel Contexts page.

  @springBootCamelTest @springBootSmokeTest @springBootAllTest
  Scenario: Check the suspend operation on Camel Context
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Contexts page
    And User selects "SampleCamel" context from the table
    And The "SampleCamel" context is started
    When User clicks on Suspend button in Contexts
    Then Camel "SampleCamel" context has "Suspended" state

  @springBootCamelTest @springBootSmokeTest @springBootAllTest
  Scenario: Check the start operation on Camel Context
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Contexts page
    And User selects "SampleCamel" context from the table
    And The "SampleCamel" context is suspended
    When User clicks on Start button in Contexts
    Then Camel "SampleCamel" context has "Started" state
