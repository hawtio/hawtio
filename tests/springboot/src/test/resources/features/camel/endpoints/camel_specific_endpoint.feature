Feature: Checking the functionality of a Camel Specific Endpoint page.

  @springBootCamelTest @springBootAllTest
  Scenario: Check, that table of Attribute tab in Camel Specific Endpoint page is not empty
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "mock://result" node of Endpoints folder of "SampleCamel" context
    When User clicks on Attributes tab of Camel Specific Endpoint page
    Then Camel Attributes table with "Attribute" column is presented

  @springBootCamelTest @springBootAllTest
  Scenario: Check specific endpoint attribute's detail information
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "mock://result" node of Endpoints folder of "SampleCamel" context
    When User opens Attribute detail dialog with the name "Camel id"
    Then The value of attribute in Attribute detail dialog is "SampleCamel"

  @springBootCamelTest @springBootAllTest
  Scenario: Check to execute operation of Specific Endpoint
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "mock://result" node of Endpoints folder of "SampleCamel" context
    And User clicks on Operations tab of Camel Specific Endpoint page
    When User executes operation with name "getCamelId()"
    Then Result of "getCamelId()" operation is "SampleCamel"

  @springBootCamelTest @springBootAllTest
  Scenario: Add an Endpoint from URI
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Endpoints folder of "SampleCamel" context
    And User clicks on Endpoints tab of Camel Endpoints page
    When User adds Endpoint "mock://test" from URI
    And Successful message in Camel Endpoints is appeared and closed
    Then Endpoint URI "mock://test" is added into Attributes table

  @springBootCamelTest @springBootAllTest
  Scenario: Check to send and browse the message
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "mock://test" node of Endpoints folder of "SampleCamel" context
    And User clicks on Send tab of Camel Specific Endpoint page
    When User sends a predefined XML message with "CamelFileName" header and "TEST_MESSAGE_1" header's value
    Then User is on Camel "mock://test" node of Endpoints folder of "SampleCamel" context
    And User clicks on Browse tab of Camel Specific Endpoint page
    And The sent message with "TEST_MESSAGE_1" id is presented

  @springBootCamelTest @springBootAllTest
  Scenario: Check to forward and browse the message
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "mock://test" node of Endpoints folder of "SampleCamel" context
    And User clicks on Browse tab of Camel Specific Endpoint page
    When User forwards "TEST_MESSAGE_1" message to "mock://result" Endpoint
    Then User is on Camel "mock://result" node of Endpoints folder of "SampleCamel" context
    And User clicks on Browse tab of Camel Specific Endpoint page
    And The sent message with "TEST_MESSAGE_1" id is presented
