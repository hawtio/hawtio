Feature: Checking the functionality of Camel Routes page.

  @springBootSmokeTest @springBootAllTest @quarkusSmokeTest @quarkusAllTest
  Scenario Outline: Check that Routes table on Camel Routes page is not empty
    Given User is on "Camel" page
    When User is on Camel "routes" folder of "SampleCamel" context
    Then Camel table "<column>" column is not empty
    And Camel table has "<name>" key and "<state>" value

    Examples: Columns
      | column | name   | state   |
      | Name   | cron   | Started |
      | State  | simple | Started |

  @springBootAllTest @quarkusAllTest
  Scenario Outline: Check the operations on Camel Routes page
    Given User is on "Camel" page
    And User is on Camel "routes" folder of "SampleCamel" context
    And Camel "cron" item has "<initial state>" state in Camel table
    When User selects "cron" item in Camel table
    And User clicks on "<action>" button in Camel table
    Then Camel "cron" item has "<desired state>" state in Camel table

    Examples: Routes actions and states
      | action | initial state | desired state |
      | Stop   | Started       | Stopped       |
      | Start  | Stopped       | Started       |

  @springBootAllTest @quarkusAllTest
  Scenario: Check the delete operation on Camel route
    Given User is on "Camel" page
    And User is on Camel "routes" folder of "SampleCamel" context
    When User selects "cron" item in Camel table
    And User clicks on "Stop" button in Camel table
    And Camel "cron" item has "Stopped" state in Camel table
    And User clicks on Delete button in dropdown in routes table
    And User confirms deletion on Camel Routes page
    Then Camel "cron" item searched by "Name" is not in Camel table

  @springBootAllTest @quarkusAllTest
  Scenario: Check that Camel Routes diagram is presented
    Given User is on "Camel" page
    And User is on Camel "routes" folder of "SampleCamel" context
    When User clicks on Camel "Route Diagram" tab
    Then Camel Route diagram is presented

  @springBootAllTest @quarkusAllTest
  Scenario: Check that Camel Source is not empty
    Given User is on "Camel" page
    And User is on Camel "routes" folder of "SampleCamel" context
    When User clicks on Camel "Source" tab
    Then Route source code is presented
