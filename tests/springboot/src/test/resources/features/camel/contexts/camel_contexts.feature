Feature: Checking the changes of states after performing some operation on Camel Contexts page.

  @springBootSmokeTest @springBootAllTest
  Scenario Outline: Check the operations on Camel Context
    Given User is on "Camel" page
    And User is on Camel Contexts
    And Camel "SampleCamel" context has "<initial state>" state
    When User selects "SampleCamel" context in Contexts
    And User clicks on "<action>" button in Contexts
    Then Camel "SampleCamel" context has "<desired state>" state

    Examples: Context actions and states
    | action  | initial state | desired state |
    | Suspend | Started       | Suspended     |
    | Start   | Suspended     | Started       |
