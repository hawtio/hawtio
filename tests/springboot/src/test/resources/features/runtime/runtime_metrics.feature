Feature: Checking the functionality of Metrics tab.

  @springBootSmokeTest @springBootAllTest
  Scenario Outline: Check that Metrics are presented
    Given User clicks on Runtime tab in the left-side menu
    And User is on Metrics tab of Runtime page
    When User checks metric with name "<metricsName>"
    Then Data of metric with name "<metricsName>" is presented

    Examples: Names of Metrics
      | metricsName |
      | JVM         |
      | System      |
