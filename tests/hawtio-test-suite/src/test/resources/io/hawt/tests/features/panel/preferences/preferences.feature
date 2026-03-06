@preferences
Feature: Checking the functionality of a Preferences tab

  Scenario Outline: Check that the tabs contain the data
    Given User clicks on "Preferences" option in hawtio drop-down menu
    When User is on "<tab>" tab of Preferences page
    Then The content of Preferences page is open

    Examples:
      | tab          |
      | Home         |
      | Console Logs |
      | Jolokia      |
      | Camel        |
      | JMX          |
      | Server Logs  |

  @notOnline
  Scenario: Check that Home tab works
    Given User clicks on "Preferences" option in hawtio drop-down menu
    And User is on "Home" tab of Preferences page
    When User toggles the show vertical navigation field
    When User clicks on Reset button
    And User confirms modal "reset-settings-modal" resetting with confirmation "You are about to reset all the Hawtio settings." and clicks reset button "[data-testid='reset-btn']"
    Then User is presented with a successful alert message

  Scenario: Check that Console Logs tab works
    Given User clicks on "Preferences" option in hawtio drop-down menu
    And User is on "Console Logs" tab of Preferences page
    When User slides log level
    Then User adds child logger
    And User sees added child logger
    And User is able to delete child logger

  @notOnline
  Scenario: Check that Jolokia tab works
    Given User clicks on "Preferences" option in hawtio drop-down menu
    And User is on "Jolokia" tab of Preferences page
    When User changes Jolokia values
    And User applies effects of Jolokia values
    Then Change stays after reload
    And User clicks on Reset button
    Then User confirms modal "clear-connections-modal" resetting with confirmation "You are about to clear all saved connection settings." and clicks reset button "[data-testid='clear-btn']"
    And User is presented with a successful alert message

  Scenario: Check that Camel tab works
    Given User clicks on "Preferences" option in hawtio drop-down menu
    And User is on "Camel" tab of Preferences page
    When User changes Camel values
    Then Camel change stays after reload

  Scenario: Check that Server Logs tab works
    Given User clicks on "Preferences" option in hawtio drop-down menu
    And User is on "Server Logs" tab of Preferences page
    When User changes Server Logs values
    Then Server Logs change stays after reload

  Scenario: Check that JMX tab works
    Given User clicks on "Preferences" option in hawtio drop-down menu
    And User is on "JMX" tab of Preferences page
    When User views JMX preference options
    Then JMX preferences are loaded correctly