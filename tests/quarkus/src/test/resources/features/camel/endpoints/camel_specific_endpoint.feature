Feature: Checking the functionality of a Camel Specific Endpoint page.

  @quarkusSmokeTest @quarkusAllTest
  Scenario Outline: Check that the Attributes table under Attribute tab on Camel Specific Endpoint page is not empty
    Given User is on "Camel" page
    And User is on Camel "mock://result" item of "endpoints" folder of "SampleCamelQuarkus" context
    When User clicks on Camel "Attributes" tab
    Then Camel table "<column>" column is not empty
    And Camel table has "<attribute>" key and "<value>" value

    Examples: Attributes and values
    | column    | attribute   | value                |
    | Attribute | EndpointUri | mock://result        |
    | Value     | CamelId     | SampleCamelQuarkus   |

  @quarkusAllTest
  Scenario: Check specific endpoint attribute's detail information
    Given User is on "Camel" page
    And User is on Camel "mock://result" item of "endpoints" folder of "SampleCamelQuarkus" context
    And User clicks on Camel "Attributes" tab
    When User opens Attribute detail dialog with the name "CamelId"
    Then Camel Attribute Detail Dialog has "Value" key and "SampleCamelQuarkus" value

  @quarkusAllTest
  Scenario: Check to execute operation of Specific Endpoint
    Given User is on "Camel" page
    And User is on Camel "mock://result" item of "endpoints" folder of "SampleCamelQuarkus" context
    And User clicks on Camel "Operations" tab
    When User executes operation with name "getCamelId()"
    Then Result of "getCamelId()" operation is "SampleCamelQuarkus"
