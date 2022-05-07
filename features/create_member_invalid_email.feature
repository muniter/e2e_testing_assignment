Feature: Login and create a member

@user1 @web
Scenario: Login create a member and check that the member email is in the list
  Given I login
  And I navigate to the "member" functionality

  When I navigate to the "create member" functionality
  And I fill the "member edit" "name" to "|FAKE_NAME|1"
  And I fill the "member edit" "email" to "invalidemail"
  And I fill the "member edit" "notes" to "|FAKE_PARAGRAPH|1"
  And I "save" the "member"

  Then I should see member saving failed
