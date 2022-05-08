# This is the test scenario name found on the README.md
Feature: Create member without name

@user1 @web
Scenario: Login and attempt to create a member without a name and see that it works
  Given I login
  And I navigate to the "member" functionality

  When I navigate to the "create member" functionality
  And I fill the "member edit" "email" to "|FAKE_EMAIL|1"
  And I fill the "member edit" "notes" to "|FAKE_PARAGRAPH|1"
  And I "save" the "member"
  And I wait for 3 seconds
  And I go back

  # The member email is the "name" in the list view
  Then I should "see" the "member" "name" "|FAKE_EMAIL|1" in the "list"
  And I wait for 3 seconds
