@requiresJFR
Feature: Java Flight Recorder

  Scenario: Check that a recording can be made
    Given User is on "Diagnostics" page
    When User starts recording
    And User stops recording
    Then The recording is a valid jfr file

  Scenario: Check that configuration recording works
    Given User is on "Diagnostics" page
    When User sets configuration
    And User starts recording
    And User stops recording
    Then The recording is a valid jfr file
    And The recording has user configuration applied
