Feature: Checking the functionality of JMX tree.

  @springBootAllTest @quarkusAllTest
  Scenario: Check that JMX tree is expanding correctly
    Given User is on "JMX" page
    When User expands JMX tree
    Then All JMX tree nodes are "expanded"

  @springBootAllTest @quarkusAllTest
  Scenario: Check that JMX tree is collapsing correctly
    Given User is on "JMX" page
    When User collapses JMX tree
    Then All JMX tree nodes are "hidden"

  @springBootAllTest @quarkusAllTest
  Scenario: Check filtering JMX tree by string value
    Given User is on "JMX" page
    When User filters JMX tree by value of "simple"
    Then JMX tree is filtered by value of "simple"
