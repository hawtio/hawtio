Feature: Checking the functionality of a Camel Specific Component page.

  @springBootSmokeTest @springBootAllTest @quarkusSmokeTest @quarkusAllTest
  Scenario Outline: Check that the Attributes table under Attribute tab on Camel Specific Component page is not empty
    Given User is on "Camel" page
    And User is on Camel "mock" item of "components" folder of "SampleCamel" context
    When User clicks on Camel "Attributes" tab
    Then Camel table "<column>" column is not empty
    And Camel table has "<attribute>" key and "<value>" value

    Examples: Attributes and values
      | column    | attribute     | value       |
      | Attribute | ComponentName | mock        |
      | Value     | CamelId       | SampleCamel |

  @springBootAllTest @quarkusAllTest
  Scenario: Check specific endpoint attribute's detail information
    Given User is on "Camel" page
    And User is on Camel "mock" item of "components" folder of "SampleCamel" context
    And User clicks on Camel "Attributes" tab
    When User opens Attribute detail dialog with the name "ComponentName"
    Then Camel Attribute Detail Dialog has "Value" key and "mock" value

  @springBootAllTest @quarkusAllTest
  Scenario: Check to execute operation of Specific Endpoint
    Given User is on "Camel" page
    And User is on Camel "mock" item of "components" folder of "SampleCamel" context
    And User clicks on Camel "Operations" tab
    When User executes operation with name "getState()"
    Then Result of "getState()" operation is "Started"
