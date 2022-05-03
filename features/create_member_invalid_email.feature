Feature: Login and create a member

@user1 @web
Scenario: Login and create a member
  When I login
  And I wait for 2 seconds
  When I click "members-menu-item"
  And I wait for 2 seconds
  When I click "members-menu-new"
  When I enter the member "name" "|FAKE_NAME|1"
  And I enter the member "email" "invalidemail"
  And I enter the member "notes" "|FAKE_PARAGRAPH|1"
  And I click "save-member"
  Then I should see "member-create-retry"
