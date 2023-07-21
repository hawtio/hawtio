@springBootSmokeTest @springBootAllTest @notHawtioNext
# @quarkusSmokeTest @quarkusAllTest - disabled due to https://github.com/hawtio/hawtio-next/issues/348
Feature: Checking the functionality of Plugin page.

  Scenario: Check that Sample Plugin got installed and accessible
    Given User is on "Sample Plugin" page
    Then Content section has h1 title "Sample Plugin"
    And Content section has paragraph "This is a sample Hawtio plugin that is discovered dynamically at runtime."
