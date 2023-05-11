Feature: Checking the functionality of Camel Specific Route page.

  @springBootAllTest
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

  @springBootAllTest
  Scenario: Check specific endpoint attribute's detail information
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Attributes" tab
    When User opens Attribute detail dialog with the name "RouteId"
    Then Camel Attribute Detail Dialog has "Value" key and "simple" value

  @springBootAllTest
  Scenario: Check to execute operation of Specific Endpoint
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    And User clicks on Camel "Operations" tab
    When User executes operation with name "getRouteId()"
    Then Result of "getRouteId()" operation is "simple"

  @springBootAllTest
  Scenario: Check that Camel Route diagram is presented
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    When User clicks on Camel "Route Diagram" tab
    Then Camel Route diagram is presented

  @springBootAllTest
  Scenario: Check that Camel Source is not empty
    Given User is on "Camel" page
    And User is on Camel "simple" item of "routes" folder of "SampleCamel" context
    When User clicks on Camel "Source" tab
    Then Route source code is presented
