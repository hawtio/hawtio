Feature: Checking the functionality of Camel Specific Route page.

  @springBootSmokeTest @springBootAllTest @quarkusSmokeTest @quarkusAllTest
  Scenario Outline: Check that Camel Route diagram is presented
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    When User clicks on Camel "Attributes" tab
    Then Camel table "<column>" column is not empty
    And Camel table has "<attribute>" key and "<value>" value

    Examples: Attributes and values
      | column    | attribute   | value                                        |
      | Attribute | EndpointUri | quartz://simple?trigger.repeatInterval=10000 |
      | Value     | CamelId     | SampleCamel                                  |

  @springBootAllTest @quarkusAllTest
  Scenario: Check specific endpoint attribute's detail information
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Attributes" tab
    When User opens Attribute detail dialog with the name "RouteId"
    Then Camel Attribute Detail Dialog has "Value" key and "simple" value

  @springBootAllTest @quarkusAllTest
  Scenario: Check to execute operation of Specific Endpoint
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Operations" tab
    When User executes operation with name "getRouteId()"
    Then Result of "getRouteId()" operation is "simple"

  @springBootAllTest @quarkusAllTest
  Scenario: Check to view and edit chart of Specific Context
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    When User clicks on Camel "Operations" tab
    And User executes operation with name "getMaxProcessingTime()"
    And The result of the "getMaxProcessingTime()" operation is stored
    And User clicks on Camel "Chart" tab
    And User switches to Edit watches mode of Camel Chart
    And User unwatch all "simple" attributes
    And User watches "MaxProcessingTime" attribute
    And User closes Edit watches mode of Camel Chart
    Then Camel Attribute "simple MaxProcessingTime" has the same value as stored one
    And Camel Attribute "simple UptimeMillis" is not displayed in Camel Chart

  @quarkusAllTest
  Scenario: Check to start the debugging
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Debug" tab
    And Start debugging option is presented
    When User starts debugging
    Then Debugging is started

  @springBootAllTest @quarkusAllTest
  Scenario: Check to add a breakpoint while debugging
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Debug" tab
    And Debugging is started
    When User adds breakpoint on "To stream" node
    Then Breakpoint sign on "To stream" node is set: "true"

  @springBootAllTest @quarkusAllTest
  Scenario: Check to remove a breakpoint while debugging
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Debug" tab
    And Debugging is started
    When User removes breakpoint on "To stream" node
    Then Breakpoint sign on "To stream" node is set: "false"

  @springBootAllTest @quarkusAllTest
  Scenario: Check to stop the debugging
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Debug" tab
    And Debugging is started
    When User stops debugging
    Then Start debugging option is presented

  @springBootAllTest @quarkusAllTest
  Scenario: Check that Camel Route diagram is presented
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    When User clicks on Camel "Route Diagram" tab
    Then Camel Route diagram is presented

  @springBootAllTest @quarkusAllTest
  Scenario: Check that Camel Source is not empty
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    When User clicks on Camel "Source" tab
    Then Route source code is presented
