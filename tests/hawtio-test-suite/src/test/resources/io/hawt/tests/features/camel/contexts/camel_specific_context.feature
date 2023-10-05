Feature: Checking the functionality of a specific camel context page.

  @springBootSmokeTest @springBootAllTest @quarkusSmokeTest @quarkusAllTest
  Scenario Outline: Check that table of Attribute tab in Camel Specific Context page is not empty
    Given User is on "Camel" page
    And User is on Camel "SampleCamel" context
    When User clicks on Camel "Attributes" tab
    Then Camel table "<column>" column is not empty
    And Camel table has "<attribute>" key and "<value>" value

    Examples: Attributes and values
      | column    | attribute | value       |
      | Attribute | CamelId   | SampleCamel |
      | Value     | State     | Started     |

  @springBootAllTest @quarkusAllTest
  Scenario: Check to execute operation of Specific Context and returned result of String type
    Given User is on "Camel" page
    And User is on Camel "SampleCamel" context
    When User clicks on Camel "Operations" tab
    When User executes operation with name "getCamelId()"
    Then Result of "getCamelId()" operation is "SampleCamel"

  @springBootAllTest @quarkusAllTest
  Scenario: Check to execute operation of Specific Context and returned result of boolean type
    Given User is on "Camel" page
    And User is on Camel "SampleCamel" context
    When User clicks on Camel "Operations" tab
    When User executes operation with name "isLogMask()"
    Then Result of "isLogMask()" operation is "false"

  @springBootAllTest @quarkusAllTest
  Scenario: Check to execute operation of Specific Context and returned result of Integer type
    Given User is on "Camel" page
    And User is on Camel "SampleCamel" context
    When User clicks on Camel "Operations" tab
    When User executes operation with name "getTotalRoutes()"
    Then Result of "getTotalRoutes()" operation is "2"

  @springBootAllTest @quarkusAllTest
  Scenario: Check to view and edit chart of Specific Context
    Given User is on "Camel" page
    And User is on Camel "SampleCamel" context
    When User clicks on Camel "Chart" tab
    And User switches to Edit watches mode of Camel Chart
    And User unwatch all "SampleCamel" attributes
    And User watches "TotalRoutes" attribute
    And User closes Edit watches mode of Camel Chart
    Then Camel Attribute "SampleCamel TotalRoutes" and its value "2" are displayed in Camel Chart
    And Camel Attribute "SampleCamel ExchangesFailed" is not displayed in Camel Chart

  @springBootAllTest @quarkusAllTest
  Scenario: Check the suspend action with Camel Specific Context.
    Given User is on "Camel" page
    And User is on Camel "SampleCamel" context
    When User clicks on Camel "Operations" tab
    And User executes operation with name "suspend()"
    Then Result of "suspend()" operation is "Operation successful"
    And User clicks on Camel "Attributes" tab
    And Camel table has "State" key and "Suspended" value

  @springBootAllTest @quarkusAllTest
  Scenario: Check the start action with Camel Specific Context.
    Given User is on "Camel" page
    And User is on Camel "SampleCamel" context
    When User clicks on Camel "Operations" tab
    And User executes operation with name "start()"
    Then Result of "start()" operation is "Operation successful"
    And User clicks on Camel "Attributes" tab
    And Camel table has "State" key and "Started" value
