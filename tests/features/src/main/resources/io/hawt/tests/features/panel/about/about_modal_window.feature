Feature: Check whether all data is presented and displayed correctly in About modal window.

  @springBootSmokeTest @springBootAllTest
  Scenario Outline: Check that the titles are presented in Spring Boot About modal window
    Given User clicks on "About" option in Question mark drop-down menu
    Then The "Hawtio Spring Boot 2 Sample app for E2E testing purposes" header is presented in About modal window
    And The "<component>" is presented in About modal window
    Then About modal window is closed

    Examples: Names of Hawtio's Components
      | component          |
      | Hawtio             |
      | Hawtio React       |

  @quarkusSmokeTest @quarkusAllTest
  Scenario Outline: Check that the titles are presented in Quarkus About modal window
    Given User clicks on "About" option in Question mark drop-down menu
    Then The "Hawtio Management Console" header is presented in About modal window
    And The "<component>" is presented in About modal window
    Then About modal window is closed

    Examples: Names of Hawtio's Components
      | component          |
      | Hawtio             |
      | Hawtio React       |
