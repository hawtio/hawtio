Feature: Checking the functionality of a Camel Specific Endpoint page.

  @springBootSmokeTest @springBootAllTest @quarkusSmokeTest @quarkusAllTest
  Scenario Outline: Check that the Attributes table under Attribute tab on Camel Specific Endpoint page is not empty
    Given User is on "Camel" page
    And User is on Camel "mock://result" item of "endpoints" folder of "SampleCamel" context
    When User clicks on Camel "Attributes" tab
    Then Camel table "<column>" column is not empty
    And Camel table has "<attribute>" key and "<value>" value

    Examples: Attributes and values
    | column    | attribute   | value         |
    | Attribute | EndpointUri | mock://result |
    | Value     | CamelId     | SampleCamel   |

  @springBootAllTest @quarkusAllTest
  Scenario: Check specific endpoint attribute's detail information
    Given User is on "Camel" page
    And User is on Camel "mock://result" item of "endpoints" folder of "SampleCamel" context
    And User clicks on Camel "Attributes" tab
    When User opens Attribute detail dialog with the name "CamelId"
    Then Camel Attribute Detail Dialog has "Value" key and "SampleCamel" value

  @springBootAllTest @quarkusAllTest
  Scenario: Check to execute operation of Specific Endpoint
    Given User is on "Camel" page
    And User is on Camel "mock://result" item of "endpoints" folder of "SampleCamel" context
    And User clicks on Camel "Operations" tab
    When User executes operation with name "getCamelId()"
    Then Result of "getCamelId()" operation is "SampleCamel"

  @springBootAllTest @quarkusAllTest
  Scenario: Check sending a message
    Given User is on "Camel" page
    And User is on Camel "mock://bar" item of "endpoints" folder of "SampleCamel" context
    And User clicks on Camel "Send" tab
    When User sets "CamelFileName" header with value of "Test Name"
    And User adds "Hello Test" message body
    And User sets "plaintext" message type
    And User sends the message
    And Successful alert message is appeared and closed
    Then User clicks on Camel "Browse" tab
    And User can browse the message with "Hello Test" body

  @springBootAllTest @quarkusAllTest
  Scenario: Check forwarding the message
    Given User is on "Camel" page
    And User is on Camel "mock://bar" item of "endpoints" folder of "SampleCamel" context
    And User clicks on Camel "Browse" tab
    When User selects the message with "Hello Test" body
    And User forwards the message to "mock://result" URI
    Then User is on Camel "mock://result" item of "endpoints" folder of "SampleCamel" context
    And User clicks on Camel "Browse" tab
    And User can browse the message with "Hello Test" body

  @springBootAllTest @quarkusAllTest
  Scenario: Check details of the message
    Given User is on "Camel" page
    And User is on Camel "endpoints" folder of "SampleCamel" context
    And User is on Camel "mock://result" item of "endpoints" folder of "SampleCamel" context
    And User clicks on Camel "Browse" tab
    When User clicks on the message with "Hello Test" body
    Then Details of the message with "Hello Test" body are displayed
