Feature: The About modal windows shows the basic information about Hawtio's components and versions.
  Checking that all data is presented and correctly displayed.

  @springBootSmokeTest @springBootAllTest
  Scenario Outline: Check the About modal window correctly displays the information about Hawtio components and versions
    Given User is on Hawtio main page
    When User clicks on About option in About drop-down menu
    Then The "Hawtio Management Console" header is presented in About modal window
    And The "<component>" is presented in About modal window
    Then About modal window is closed

    Examples: Names of Hawtio's Components
      | component          |
      | Hawtio             |
      | Hawtio Core        |
      | Hawtio Integration |
      | Hawtio OAuth       |
