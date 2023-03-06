Feature: All functions on the Jobs tab on the Quartz page work

  @springBootQuartzTest @springBootAllTest @dev
  Scenario: Check the jobs filtering by Group
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Jobs tab of Quartz Specific Scheduler page
    When User filters table by "Group" of string "Camel_SampleCamel"
    Then Table is filtered by string "Camel_SampleCamel" in "Group" column

  @springBootQuartzTest @springBootAllTest @dev
  Scenario: Check the jobs filtering by Name
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Jobs tab of Quartz Specific Scheduler page
    When User filters table by "Name" of string "simple"
    Then Table is filtered by string "simple" in "Name" column

  @springBootQuartzTest @springBootAllTest @dev
  Scenario: Check the jobs filtering by Durable
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Jobs tab of Quartz Specific Scheduler page
    When User filters table by "Durable" of enum "false"
    Then Table is filtered by string "false" in "Durable" column

  @springBootQuartzTest @springBootAllTest @dev
  Scenario: Check the jobs filtering by Recover
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Jobs tab of Quartz Specific Scheduler page
    When User filters table by "Recover" of enum "false"
    Then Table is filtered by string "false" in "Recover" column

  @springBootQuartzTest @springBootAllTest @dev
  Scenario: Check the jobs filtering by Job ClassName
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Jobs tab of Quartz Specific Scheduler page
    When User filters table by "Job ClassName" of string "org.apache.camel.component.quartz2.CamelJob"
    Then Table is filtered by string "org.apache.camel.component.quartz2.CamelJob" in "Job ClassName" column

  @springBootQuartzTest @springBootAllTest @dev
  Scenario Outline: Check specific job data map details dialog
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Jobs tab of Quartz Specific Scheduler page
    When User opens Job DataMap details dialog with name "simple"
    Then Key "<key>" has "<value>" value in Job DataMap details dialog

    Examples: Key and values of Job DataMap details dialog
      | key                                    | value                                        |
      | CamelQuartzCamelContextName            | SampleCamel                                  |
      | CamelQuartzEndpoint                    | quartz://simple?trigger.repeatInterval=10000 |
      | CamelQuartzTriggerSimpleRepeatCounter  | -1                                           |
      | CamelQuartzTriggerSimpleRepeatInterval | 10000                                        |
      | CamelQuartzTriggerType                 | simple                                       |
