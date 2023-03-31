Feature: Checking the functionality of System Properties tab.

  @springBootAllTest
  Scenario: Check the system properties filtering by name
    Given User clicks on Runtime tab in the left-side menu
    And User is on System Properties tab of Runtime page
    When User filters table by "Name" of string "java"
    Then Table is filtered by string "java" in "Property" column

  @springBootAllTest
  Scenario: Check the system properties filtering by value
    Given User clicks on Runtime tab in the left-side menu
    And User is on System Properties tab of Runtime page
    When User filters table by "Value" of string "java"
    Then Table is filtered by string "java" in "Value" column

  @springBootAllTest
  Scenario: Check the system properties sorting ascending by property
    Given User clicks on Runtime tab in the left-side menu
    And User is on System Properties tab of Runtime page
    When User sorts table ascending by "Property" column
    Then Table is sorted ascendant "true" by "Property" column by text

  @springBootAllTest
  Scenario: Check the system properties sorting descending by property
    Given User clicks on Runtime tab in the left-side menu
    And User is on System Properties tab of Runtime page
    When User sorts table descending by "Property" column
    Then Table is sorted ascendant "false" by "Property" column by text

  @springBootAllTest
  Scenario: Check the system properties sorting ascending by value
    Given User clicks on Runtime tab in the left-side menu
    And User is on System Properties tab of Runtime page
    When User sorts table ascending by "Value" column
    Then Table is sorted ascendant "true" by "Value" column by text

  @springBootAllTest
  Scenario: Check the system properties sorting descending by value
    Given User clicks on Runtime tab in the left-side menu
    And User is on System Properties tab of Runtime page
    When User sorts table descending by "Value" column
    Then Table is sorted ascendant "false" by "Value" column by text
