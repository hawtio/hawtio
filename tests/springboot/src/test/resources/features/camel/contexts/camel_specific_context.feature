Feature:  Checking the functionality of a specific camel context.

  @springBootCamelTest @springBootAllTest
  Scenario: Check that table of Attribute tab in Camel Specific Context page is not empty
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "SampleCamel" context
    When User clicks on Attributes tab of Camel Specific Context page
    Then Camel Attributes table with "Attribute" column is presented

  @springBootCamelTest @springBootAllTest
  Scenario: Check specific context attribute's detail information
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "SampleCamel" context
    When User opens Attribute detail dialog with the name "Camel id"
    Then The value of attribute in Attribute detail dialog is "SampleCamel"

  @springBootCamelTest @springBootAllTest
  Scenario: Check to execute operation of Specific Context
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "SampleCamel" context
    And User clicks on Operations tab of Camel Specific Context page
    When User executes operation with name "getCamelId()"
    Then Result of "getCamelId()" operation is "SampleCamel"

  @springBootCamelTest @springBootAllTest
  Scenario: Check to view chart of Specific Context
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "SampleCamel" context
    When User clicks on Chart tab of Camel Specific Context page
    Then Camel Attribute "Started routes" and its value "2.0" are displayed in Chart of Camel page

  @springBootCamelTest @springBootAllTest
  Scenario: Check to edit chart of Specific Context
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "SampleCamel" context
    And User clicks on Chart tab of Camel Specific Context page
    And User switches to Edit chart mode of Camel page
    When User edits the chart of Camel page by attribute "Started routes"
    Then Camel Attribute "Started routes" and its value "2.0" are displayed in Chart of Camel page

  @springBootCamelTest @springBootAllTest
  Scenario: Check the suspend action with Camel Specific Context.
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "SampleCamel" context
    When User sets suspend in the dropdown menu of Camel Specific Context
    Then State of Camel Specific Context is "Suspended"

  @springBootCamelTest @springBootAllTest
  Scenario: Check the start action with Camel Specific Context.
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "SampleCamel" context
    When User sets start in the dropdown menu of Camel Specific Context
    Then State of Camel Specific Context is "Started"
