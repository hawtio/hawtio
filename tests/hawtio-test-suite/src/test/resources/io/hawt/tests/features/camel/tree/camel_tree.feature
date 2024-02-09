Feature: Checking the functionality of Camel tree.

  Scenario: Check that Camel tree is expanding correctly
    Given User is on "Camel" page
    When User expands Camel tree
    Then All Camel tree nodes are "expanded"

  Scenario: Check that Camel tree is collapsing correctly
    Given User is on "Camel" page
    When User collapses Camel tree
    Then All Camel tree nodes are "hidden"

  Scenario: Check filtering Camel tree by string value
    Given User is on "Camel" page
    When User filters Camel tree by value of "simple"
    Then Camel tree is filtered by value of "simple"
