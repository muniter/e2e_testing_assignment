Feature: Login and fail at creating member with a duplicate email adddress

@user1 @web
Scenario: Login and fail at creating member with a duplicate email adddress
  Given I login
  And I navigate to the "member" functionality

  # First member
  When I navigate to the "create member" functionality
  And I fill the "member" "name" to "|FAKE_NAME|1"
  And I fill the "member" "email" to "|FAKE_EMAIL|1"
  And I fill the "member" "notes" to "|FAKE_PARAGRAPH|1"
  And I "save" the "member"
  And I go back
  # Second member
  And I navigate to the "create member" functionality
  And I fill the "member" "name" to "|FAKE_NAME|2"
  And I fill the "member" "email" to "|FAKE_EMAIL|2"
  And I fill the "member" "notes" to "|FAKE_PARAGRAPH|2"
  And I "save" the "member"
  And I go back
  # Try editing second member into the first member's email
  And I navigate to the "edit member" functionality with email "|FAKE_EMAIL|2"
  And I set the "member" "email" to "|FAKE_EMAIL|1"
  And I "save" the "member"

  Then I should see member saving failed
