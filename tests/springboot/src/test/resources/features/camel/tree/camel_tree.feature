Feature: All operations with Camel tree on Camel page.
  Checking whether the functionality of Camel tree is correct and all data is presented.

  @springBootCamelTest @springBootSmokeTest @springBootAllTest
  Scenario: Check that the Camel tree is expanding correctly
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel tree
    When User expands Camel tree
    Then All nodes of Camel tree are visible

  @springBootCamelTest @springBootSmokeTest @springBootAllTest
  Scenario: Check that the Camel tree is collapsing correctly
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel tree
    When User collapses Camel tree
    Then All nodes of Camel tree are hidden

  @springBootCamelTest @springBootSmokeTest @springBootAllTest
  Scenario: Check deployed contexts are presented in Camel tree
    Given User clicks on Camel tab in the left-side menu
    When User is on Camel tree
    Then Deployed "context-SampleCamel" context is presented in Camel tree

  @springBootCamelTest @springBootSmokeTest @springBootAllTest
  Scenario: Check filtering Camel tree by string value
    Given User clicks on Camel tab in the left-side menu
    And User is on Camel tree
    When User filters Camel tree by value of "mock"
    Then Camel tree is filtered by value of "mock"
