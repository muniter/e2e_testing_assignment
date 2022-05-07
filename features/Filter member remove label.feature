# This is the test scenario name found on the README.md
Feature: Filter member remove label

@user1 @web
Scenario: Login, create two members applying labels, filter them and batch remve the applied label, and check individually that it has been remove.
  Given I login
  And I go to the "member" functionality
  # First member
  When I go to the "create member" functionality
  And I fill the "member edit" "name" to "I'm getting a label"
  And I fill the "member edit" "email" to "|FAKE_EMAIL|1"
  And I fill the "member edit" "label" to "|FAKE_LABEL|1"
  And I fill the "member edit" "notes" to "|FAKE_PARAGRAPH|1"
  And I "save" the "member"
  And I go back

  # Second member
  And I go to the "create member" functionality
  And I fill the "member edit" "name" to "I'm getting a label"
  And I fill the "member edit" "email" to "|FAKE_EMAIL|2"
  And I fill the "member edit" "label" to "|FAKE_LABEL|1"
  And I fill the "member edit" "notes" to "|FAKE_PARAGRAPH|2"
  And I "save" the "member"
  And I go back
  # Filter them and delete them
  And I fill the "member list" "search" to "I'm getting a label"
  And I remove the label "|FAKE_LABEL|1" from all the filtered members

  # We check that the label doesn't exist on any of them
  Then I go to the "edit member" functionality for the member with email "|FAKE_EMAIL|1"
  And I should "not see" the "member" "label" "|FAKE_LABEL|1" in the "edit"
  And I go back
  And I go to the "edit member" functionality for the member with email "|FAKE_EMAIL|2"
  And I should "not see" the "member" "label" "|FAKE_LABEL|1" in the "edit"
  And I go back

  # Cleanup
  And I set the "member list" "search" to "I'm getting a label"
  And I delete the "multiple members"
