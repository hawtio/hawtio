@notJBang @throttling @notOnline @notKeycloak @notHawtioNext
Feature: Account Lockout (Throttling)

  Scenario: User account gets locked out after multiple failed login attempts
    Given User is on Login page
    When the user attempts to log in with incorrect credentials 5 times
    Then the user should see a message indicating account lockout for 1 second
    When the user attempts to log in with incorrect credentials 2 times
    Then the user should see a message indicating account lockout for 3 seconds
