Feature:  Checking the functionality of Help page.

Feature: Check whether all data is presented and displayed correctly in About modal window.

  @springBootSmokeTest @springBootAllTest
  Scenario Outline: Check that the titles are presented
    Given User clicks on "Help" option in Question mark drop-down menu
    And User is on "Home" tab of Help page
    When User clicks on "<linkText>" link text
    Then User is redirected to the "<url>"
    And User is returned to the previous page

    Examples: Link texts and URLs
      | linkText     | url                        |
      | Hawtio       | hawt.io                    |
      | contributing | hawt.io/docs/contributing/ |
      | GitHub       | github.com/hawtio/hawtio   |

  @springBootSmokeTest @springBootAllTest
  Scenario Outline: Check that the tabs contain data
    Given User clicks on "Help" option in Question mark drop-down menu
    When User is on "<tab>" tab of Help page
    Then The content of Help page is present

    Examples: Help page tabs
      | tab           |
      | Home          |
      | Preferences   |
      | Connect       |
      | JMX           |
      | Camel         |
      | Sample Plugin |
