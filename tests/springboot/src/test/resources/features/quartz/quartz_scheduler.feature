Feature: All functions on the Scheduler tab on the Quartz page work

  @springBootQuartzTest @springBootAllTest @dev
  Scenario: Check that Quartz Specific Scheduler info status is presented.
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz Scheduler page of "DefaultQuartzScheduler-SampleCamel" scheduler
    When User clicks on Scheduler tab of Quartz Scheduler page
    Then Info status is presented

  @springBootQuartzTest @springBootAllTest @dev
  Scenario: Check the pause action of the scheduler with Quartz Specific Scheduler
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz Scheduler page of "DefaultQuartzScheduler-SampleCamel" scheduler
    And User clicks on Scheduler tab of Quartz Scheduler page
    When User "Pause" the "Scheduler" on Quartz Scheduler page
    Then The "Scheduler" field is "paused"

  @springBootQuartzTest @springBootAllTest @dev
  Scenario: Check the start action of the scheduler with Quartz Specific Scheduler
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz Scheduler page of "DefaultQuartzScheduler-SampleCamel" scheduler
    And User clicks on Scheduler tab of Quartz Scheduler page
    When User "Start" the "Scheduler" on Quartz Scheduler page
    Then The "Scheduler" field is "ok"

  @springBootQuartzTest @springBootAllTest @dev
  Scenario: Check the start action of the statistics with Quartz Specific Scheduler
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz Scheduler page of "DefaultQuartzScheduler-SampleCamel" scheduler
    And User clicks on Scheduler tab of Quartz Scheduler page
    When User "Start" the "Statistics" on Quartz Scheduler page
    Then The "Statistics" field is "ok"

  @springBootQuartzTest @springBootAllTest @dev
  Scenario: Check the pause action of the statistics with Quartz Specific Scheduler
    Given User clicks on Quartz tab in the left-side menu
    And User is on Quartz Scheduler page of "DefaultQuartzScheduler-SampleCamel" scheduler
    And User clicks on Scheduler tab of Quartz Scheduler page
    When User "Pause" the "Statistics" on Quartz Scheduler page
    Then The "Statistics" field is "paused"
