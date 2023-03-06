Feature: All functions on the Triggers tab on the Quartz page work

  @springBootQuartzTest @springBootAllTest
  Scenario: Check, that table of Triggers tab in Quartz Scheduler page is not empty
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Triggers tab of Quartz Specific Scheduler page
    Then Quartz Triggers table with "Group" column is presented

  @springBootQuartzTest @springBootAllTest
  Scenario: Check the triggers filtering by Name
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Triggers tab of Quartz Specific Scheduler page
    When User filters table by "Name" of string "simple"
    Then Table is filtered by string "simple" in "Name" column

  @springBootQuartzTest @springBootAllTest
  Scenario: Check the triggers filtering by Group
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Triggers tab of Quartz Specific Scheduler page
    When User filters table by "Group" of string "Camel_SampleCamel"
    Then Table is filtered by string "Camel_SampleCamel" in "Group" column

  @springBootQuartzTest @springBootAllTest
  Scenario: Check the triggers filtering by Type
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Triggers tab of Quartz Specific Scheduler page
    When User filters table by "Type" of enum "simple"
    Then Table is filtered by string "simple" in "Type" column

  @springBootQuartzTest @springBootAllTest
  Scenario: Check the triggers sorting ascending by name
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Triggers tab of Quartz Specific Scheduler page
    When User sorts table ascending by "Name" column
    Then Table is sorted ascendant "true" by "Name" column by text

  @springBootQuartzTest @springBootAllTest
  Scenario: Check the triggers sorting descending by name
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Triggers tab of Quartz Specific Scheduler page
    When User sorts table descending by "Name" column
    Then Table is sorted ascendant "false" by "Name" column by text
