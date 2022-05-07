# This is the test scenario name found on the README.md
Feature: Filter member delete

@user1 @web
Scenario: Login, create two members, filter them and batch delete them, confirm they are deleted
  Given I login
  And I navigate to the "member" functionality

  # First member
  When I navigate to the "create member" functionality
  And I fill the "member edit" "name" to "I'm going to be deleted"
  And I fill the "member edit" "email" to "|FAKE_EMAIL|1"
  And I fill the "member edit" "notes" to "|FAKE_PARAGRAPH|1"
  And I "save" the "member"
  And I go back
  # Second member
  And I navigate to the "create member" functionality
  And I fill the "member edit" "name" to "I'm going to be deleted"
  And I fill the "member edit" "email" to "|FAKE_EMAIL|2"
  And I fill the "member edit" "notes" to "|FAKE_PARAGRAPH|2"
  And I "save" the "member"
  And I go back
  # Filter them and delete them
  And I fill the "member list" "search" to "I'm going to be deleted"
  And I delete the "multiple members"
  # Filter again to then check if found
  And I fill the "member list" "search" to "I'm going to be deleted"

  Then I should "not see" the "member" "email" "|FAKE_EMAIL|1" in the "list"
  And I should "not see" the "member" "email" "|FAKE_EMAIL|2" in the "list"
