Feature: Login and fail at creating a duplicate member

@user1 @web
Scenario: Login and fail at creating a duplicate member
  When I login
  And I wait for 2 seconds
  When I click "members-menu-item"
  And I wait for 2 seconds
  When I click "members-menu-new"
  When I enter the member "name" "|FAKE_NAME|1"
  And I enter the member "email" "|FAKE_EMAIL|1"
  And I enter the member "notes" "|FAKE_PARAGRAPH|1"
  And I click "save-member"
  And I wait for 1 seconds
  When I go back
  And I wait for 1 seconds
  Then I should see "|FAKE_NAME|1" in "member-list-names"
  # Now lets try to create a duplicate member
  When I click "members-menu-new"
  When I enter the member "name" "|FAKE_NAME|1"
  And I enter the member "email" "|FAKE_EMAIL|1"
  And I enter the member "notes" "|FAKE_PARAGRAPH|1"
  And I click "save-member"
  And I wait for 1 seconds
  Then I should see "member-create-retry"
