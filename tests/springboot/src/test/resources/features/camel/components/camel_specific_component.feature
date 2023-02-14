Feature: Checking the functionality of Camel Specific Component page.

  @springBootCamelTest @springBootSmokeTest @springBootAllTest
  Scenario: Check that table of Attribute tab in Camel Specific Component page is not empty
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "mock" node of Components folder of "SampleCamel" context
    When User clicks on Attributes tab of Camel Specific Component page
    Then Camel Attributes table with "Attribute" column is presented

  @springBootCamelTest @springBootSmokeTest @springBootAllTest
  Scenario: Check specific component attribute's detail information
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "mock" node of Components folder of "SampleCamel" context
    When User opens Attribute detail dialog with the name "Camel id"
    Then The value of attribute in Attribute detail dialog is "SampleCamel"

  @springBootCamelTest @springBootSmokeTest @springBootAllTest
  Scenario: Check to execute operation of Specific Component
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "mock" node of Components folder of "SampleCamel" context
    And User clicks on Operations tab of Camel Specific Component page
    When User executes operation with name "getCamelId()"
    Then Result of "getCamelId()" operation is "SampleCamel"
