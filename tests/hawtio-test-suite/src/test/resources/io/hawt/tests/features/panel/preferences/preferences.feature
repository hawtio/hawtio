@preferences
Feature: Checking the functionality of a Preferences tab

  Scenario Outline: Check that the tabs contain the data
    Given User clicks on "Preferences" option in hawtio drop-down menu
    When User is on "<tab>" tab of Preferences page
    Then The content of Preferences page is open

    Examples:
      |tab          |
      |Home         |
      |Console Logs |
      |Camel        |
      |JMX          |
      |Server Logs  |

#    @notHawtioNext @notJBang
#    Examples:
#      |Sample Plugin|

    @notOnline
    Examples:
      |Connect      |

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
  Scenario: Check that Connect tab works
    Given User clicks on "Preferences" option in hawtio drop-down menu
    And User is on "Connect" tab of Preferences page
    When User changes Jolokia values
    And User applies effects of Jolokia values
    Then Change stays after reload
    And User clicks on Reset button
    Then User confirms modal "clear-connections-modal" resetting with confirmation "You are about to clear all saved connection settings." and clicks reset button "[data-testid='clear-btn']"
    And User is presented with a successful alert message

#  @notHawtioNext @notJBang
#  Scenario: Check that Sample Plugin tab works
#    Given User clicks on "Preferences" option in hawtio drop-down menu
#    And User is on "Sample Plugin" tab of Preferences page
#    Then Content section has h2 title "Sample Plugin"
#    And Content section has paragraph "Preferences view for the custom plugin."
