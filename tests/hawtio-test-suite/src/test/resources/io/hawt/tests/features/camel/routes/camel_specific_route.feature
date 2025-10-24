Feature: Checking the functionality of Camel Specific Route page.

  Scenario Outline: Check that Camel Route diagram is presented
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    When User clicks on Camel "Attributes" tab
    Then Camel table "<column>" column is not empty
    And Camel table has "<attribute>" key and "<value>" value

    Examples: Attributes and values
      | column    | attribute   | value                                        |
      | Attribute | EndpointUri | quartz://simple?trigger.repeatInterval=10000 |
      | Value     | CamelId     | SampleCamel                                  |

  Scenario Outline: Check the Camel attributes are sorted correctly
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    When User clicks on Camel "Attributes" tab
    Then Attributes table is sorted "<desiredOrder>" by "<headerName>"

    Examples: Order options and Header names
      | desiredOrder | headerName |
      | ascending    | Attribute  |
      | descending   | Attribute  |

  Scenario: Check specific endpoint attribute's detail information
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Attributes" tab
    When User expands Attribute details with the name "RouteId"
    Then Camel Attribute details have "Value" key and "simple" value

  Scenario: Check to execute operation of Specific Endpoint
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Operations" tab
    When User executes operation with name "getRouteId()"
    Then Result of "getRouteId()" operation is "simple"

  Scenario: Check to view and edit chart of Specific Context
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    When User clicks on Camel "Operations" tab
    And User executes operation with name "getMaxProcessingTime()"
    And The result of the "getMaxProcessingTime()" operation is stored
    And User clicks on Camel "Chart" tab
    And User switches to Edit watches mode of Camel Chart
    And User unwatch all "simple" attributes
    And User watches "MaxProcessingTime" attribute
    And User closes Edit watches mode of Camel Chart
    Then Camel Attribute "MaxProcessingTime" has the same value as stored one
    And Camel Attribute "UptimeMillis" is not displayed in Camel Chart

  @quarkus
  Scenario: Check to start the debugging
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Debug" tab
    And Start debugging option is presented
    When User starts debugging
    Then Debugging is started

  Scenario: Check to add a breakpoint while debugging
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Debug" tab
    And Debugging is started
    When User adds breakpoint on "To stream" node
    Then Breakpoint sign on "To stream" node is set: "true"

  Scenario: Check to remove a breakpoint while debugging
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Debug" tab
    And Debugging is started
    When User removes breakpoint on "To stream" node
    Then Breakpoint sign on "To stream" node is set: "false"

  Scenario: Check to stop the debugging
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Debug" tab
    And Debugging is started
    When User stops debugging
    Then Start debugging option is presented

  Scenario: Check that Camel Route diagram is presented
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    When User clicks on Camel "Route Diagram" tab
    Then Camel Route diagram is presented

  Scenario: Check that Camel Source is not empty
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    When User clicks on Camel "Source" tab
    Then Route source code is presented

  Scenario: Check Camel Properties tab is not empty
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    When User clicks on Camel "Properties" tab
    Then Default quartz properties of "simple" are Auto Startup: "true", Log Mask: "false", Delayer: "advanced"

  Scenario: Check Camel Trace stops tracing
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Trace" tab
    When User stops tracing
    Then Tracing not shows trace
    And Tracing not shows diagram

  Scenario: Check Camel Trace starts tracing
    Given User is on "Camel" page
    And User is on Camel "simple" item of "default" group of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Trace" tab
    And User stops tracing
    And Tracing not shows trace
    When User starts tracing
    Then Tracing shows trace
    And Tracing shows diagram
