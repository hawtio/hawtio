Feature: Checking the functionality of Camel Endpoints page.

  @springBootCamelTest @springBootAllTest
  Scenario: Check, that table of Attribute tab in Camel Endpoints page is not empty
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Endpoints folder of "SampleCamel" context
    When User clicks on Attributes tab of Camel Endpoints page
    Then Camel Attributes table with "Context" column is presented

  @springBootCamelTest @springBootAllTest
  Scenario: Check, that table of Endpoints tab in Camel Endpoints page is not empty
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Endpoints folder of "SampleCamel" context
    When User clicks on Endpoints tab of Camel Endpoints page
    Then Camel Endpoints table with "URI" column is presented

  @springBootCamelTest @springBootAllTest
  Scenario: Check to add an Endpoint from URI
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Endpoints folder of "SampleCamel" context
    And User clicks on Endpoints tab of Camel Endpoints page
    When User adds Endpoint "timer://foo?period=1000" from URI
    And Successful message in Camel Endpoints is appeared and closed
    Then Endpoint URI "timer://foo?period=1000" is added into Attributes table

  @springBootCamelTest @springBootAllTest
  Scenario: Check to edit chart of Endpoints
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Endpoints folder of "SampleCamel" context
    And User clicks on Chart tab of Camel Endpoints page
    When User switches to Edit chart mode of Camel page
    And User edits "timer://foo\?period=1000: Period" of the chart of Camel page by attribute "Period"
    Then Camel Attribute "timer://foo\?period=1000: Period" and its value "1.0k" are displayed in Chart of Camel page

  @springBootCamelTest @springBootAllTest
  Scenario: Check to view chart of Endpoints
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Endpoints folder of "SampleCamel" context
    When User clicks on Chart tab of Camel Endpoints page
    Then Camel Attribute "Period" is displayed in Chart of Camel page

  @springBootCamelTest @springBootAllTest
  Scenario: Check to edit chart of Endpoints
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel Endpoints folder of "SampleCamel" context
    And User clicks on Chart tab of Camel Endpoints page
    When User switches to Edit chart mode of Camel page
    And User edits "timer://foo\?period15000: Period" of the chart of Camel page by attribute "Period"
    Then Camel Attribute "timer://foo\?period=1000: Period" and its value "1.0k" are displayed in Chart of Camel page
