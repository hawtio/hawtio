Feature: Checking the functionality of Threads tab.

  @springBootSmokeTest @springBootAllTest
  Scenario: Check Thread Detail dialog information
    Given User clicks on Runtime tab in the left-side menu
    And User is on Threads tab of Runtime page
    When User opens Thread Detail dialog of row "1" from the table
    Then Thread of row "1" from the table has the same ID and Name in Thread Detail dialog

  @springBootSmokeTest @springBootAllTest
  Scenario: Check the threads filtering by name
    Given User clicks on Runtime tab in the left-side menu
    And User is on Threads tab of Runtime page
    When User filters table by "Name" of string "http"
    Then Table is filtered by string "http" in "Name" column

  @springBootSmokeTest @springBootAllTest
  Scenario: Check the threads filtering by state Waiting
    Given User clicks on Runtime tab in the left-side menu
    And User is on Threads tab of Runtime page
    When User filters table by "State" of enum "Waiting"
    Then Table is filtered by string "Waiting" in "State" column

  @springBootSmokeTest @springBootAllTest
  Scenario: Check the threads filtering by state Runnable
    Given User clicks on Runtime tab in the left-side menu
    And User is on Threads tab of Runtime page
    When User filters table by "State" of enum "Runnable"
    Then Table is filtered by string "Runnable" in "State" column

  @springBootSmokeTest @springBootAllTest
  Scenario: Check the threads sorting ascending by id
    Given User clicks on Runtime tab in the left-side menu
    And User is on Threads tab of Runtime page
    When User sorts table ascending by "ID" column
    Then Table is sorted ascendant "true" by "ID" column by integer

  @springBootSmokeTest @springBootAllTest
  Scenario: Check the threads sorting descending by id
    Given User clicks on Runtime tab in the left-side menu
    And User is on Threads tab of Runtime page
    When User sorts table descending by "ID" column
    Then Table is sorted ascendant "false" by "ID" column by integer

  @springBootSmokeTest @springBootAllTest
  Scenario: Check the threads sorting ascending by name
    Given User clicks on Runtime tab in the left-side menu
    And User is on Threads tab of Runtime page
    When User sorts table ascending by "Name" column
    Then Table is sorted ascendant "true" by "Name" column by text

  @springBootSmokeTest @springBootAllTest
  Scenario: Check the threads sorting descending by name
    Given User clicks on Runtime tab in the left-side menu
    And User is on Threads tab of Runtime page
    When User sorts table descending by "Name" column
    Then Table is sorted ascendant "false" by "Name" column by text

  @springBootSmokeTest @springBootAllTest
  Scenario: Check the threads sorting ascending by state
    Given User clicks on Runtime tab in the left-side menu
    And User is on Threads tab of Runtime page
    When User sorts table ascending by "State" column
    Then Table is sorted ascendant "true" by "State" column by text

  @springBootSmokeTest @springBootAllTest
  Scenario: Check the threads sorting descending by state
    Given User clicks on Runtime tab in the left-side menu
    And User is on Threads tab of Runtime page
    When User sorts table descending by "State" column
    Then Table is sorted ascendant "false" by "State" column by text
