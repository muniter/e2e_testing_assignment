Feature: 1.Create member

@user1 @web
Scenario: Login create a member and check that the member email is in the list
  Given I login
  And I navigate to the "member" functionality

  When I navigate to the "create member" functionality
  And I fill the "member edit" "name" to "|FAKE_NAME|1"
  And I fill the "member edit" "email" to "|FAKE_EMAIL|1"
  And I fill the "member edit" "notes" to "|FAKE_PARAGRAPH|1"
  And I "save" the "member"
  And I go back

  Then I should "see" the "member" "email" "|FAKE_EMAIL|1" in the "list"
  And I should "see" the "member" "name" "|FAKE_NAME|1" in the "list"
