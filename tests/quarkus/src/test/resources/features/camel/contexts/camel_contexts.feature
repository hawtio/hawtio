@quarkusSmokeTest @quarkusAllTest
Feature: Checking the changes of states after performing some operation on Camel Contexts page.

  Scenario Outline: Check the operations on Camel Context
    Given User is on "Camel" page
    And Camel "SampleCamelQuarkus" item has "<initial state>" state in Camel table
    When User selects "SampleCamelQuarkus" item in Camel table
    And User clicks on "<action>" button in Camel table
    Then Camel "SampleCamelQuarkus" item has "<desired state>" state in Camel table

    Examples: Context actions and states
    | action  | initial state | desired state |
    | Suspend | Started       | Suspended     |
    | Start   | Suspended     | Started       |
