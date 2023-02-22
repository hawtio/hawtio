Feature: Checking the functionality of Camel Specific Route page.

  @springBootCamelTest @springBootAllTest
  Scenario: Check that diagram of specific route is present after debugging start.
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "simple" node of Routes folder of "SampleCamel" context
    And User clicks on Debug tab of Camel Specific Route page
    When User clicks on Start debugging button
    Then Camel Route diagram is presented

  @springBootCamelTest @springBootAllTest
  Scenario: Check the breakpoint adding on debug page of specific route.
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "simple" node of Routes folder of "SampleCamel" context
    And User clicks on Debug tab of Camel Specific Route page
    And User clicks on Start debugging button
    When User adds breakpoint on "node-Set Body: Hello Camel! - simple" node
    Then The breakpoint sign is appearing on "node-Set Body: Hello Camel! - simple" node
    And User clicks on Stop debugging button

  @springBootCamelTest @springBootAllTest
  Scenario: Check the breakpoint removing on debug page of specific route.
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "simple" node of Routes folder of "SampleCamel" context
    And User clicks on Debug tab of Camel Specific Route page
    And User clicks on Start debugging button
    And User adds breakpoint on "node-Set Body: Hello Camel! - simple" node
    When User removes breakpoint from "node-Set Body: Hello Camel! - simple" node
    Then The breakpoint sign is NOT appearing on "node-Set Body: Hello Camel! - simple" node
    And User clicks on Stop debugging button

  @springBootCamelTest @springBootAllTest
  Scenario: Check the stopping of debugging on debug page of specific route.
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "simple" node of Routes folder of "SampleCamel" context
    And User clicks on Debug tab of Camel Specific Route page
    And User clicks on Start debugging button
    When User clicks on Stop debugging button
    Then The debugging is stopped

  @springBootCamelTest @springBootAllTest
  Scenario: Check that table of Attribute tab in Camel Specific Route page is not empty
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "simple" node of Routes folder of "SampleCamel" context
    When User clicks on Attributes tab of Camel Specific Route page
    Then Camel Attributes table with "Attribute" column is presented

  @springBootCamelTest @springBootAllTest
  Scenario: Check specific route attribute's detail information
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "simple" node of Routes folder of "SampleCamel" context
    When User opens Attribute detail dialog with the name "Camel id"
    Then The value of attribute in Attribute detail dialog is "SampleCamel"

  @springBootCamelTest @springBootAllTest
  Scenario: Check that diagram of Route Diagram tab in Camel Specific Route is presented
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "simple" node of Routes folder of "SampleCamel" context
    When User clicks on Route Diagram tab of Camel Specific Route page
    Then Camel Route diagram is presented

  @springBootCamelTest @springBootAllTest
  Scenario: Check to execute operation of Specific Route
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "simple" node of Routes folder of "SampleCamel" context
    And User clicks on Operations tab of Camel Specific Route page
    When User executes operation with name "getCamelId()"
    Then Result of "getCamelId()" operation is "SampleCamel"

  @springBootCamelTest @springBootAllTest
  Scenario: Check to view chart of Specific Route
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "simple" node of Routes folder of "SampleCamel" context
    When User clicks on Chart tab of Camel Specific Route page
    Then Camel Attribute "Min processing time" and its value "0.0" are displayed in Chart of Camel page

  @springBootCamelTest @springBootAllTest
  Scenario: Check to edit chart of Specific Route
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "simple" node of Routes folder of "SampleCamel" context
    And User clicks on Chart tab of Camel Specific Route page
    And User switches to Edit chart mode of Camel page
    When User edits the chart of Camel page by attribute "Min processing time"
    Then Camel Attribute "Min processing time" and its value "0.0" are displayed in Chart of Camel page

  @springBootCamelTest @springBootAllTest
  Scenario: Check that defined, default and undefined properties of specific route are displayed
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "simple" node of Routes folder of "SampleCamel" context
    When User clicks on Properties tab of Camel Specific Route page
    Then Defined, default and undefined properties are displayed

  @springBootCamelTest @springBootAllTest
  Scenario: Check the stop action with Camel Specific Route.
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel "simple" node of Routes folder of "SampleCamel" context
    When User sets stop in the dropdown menu of Camel Specific Route
    Then State of Camel Specific Route is "Stopped"
