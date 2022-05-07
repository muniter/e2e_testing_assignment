Feature: Login and create a member validation

@user1 @web
Scenario: Login and attempt to create a member with an invalid email
  Given I login
  And I navigate to the "member" functionality

  When I navigate to the "create member" functionality
  And I fill the "member edit" "email" to "invalidemail"
  And I fill the "member edit" "notes" to "|FAKE_PARAGRAPH|1"
  And I "save" the "member"

  Then I should see member saving failed
