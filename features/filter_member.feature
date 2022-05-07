Feature: Login, Create Member, Filter Member

@user1 @web
Scenario: Login create members with distinct names, and then filter and get the expected results
  Given I login
  And I navigate to the "member" functionality

  # First member
  When I navigate to the "create member" functionality
  And I fill the "member edit" "name" to "Danilo Montes"
  And I fill the "member edit" "email" to "|FAKE_EMAIL|1"
  And I fill the "member edit" "notes" to "|FAKE_PARAGRAPH|1"
  And I "save" the "member"
  And I go back
  # Second member
  And I navigate to the "create member" functionality
  And I fill the "member edit" "name" to "El ZZZZorro"
  And I fill the "member edit" "email" to "|FAKE_EMAIL|2"
  And I fill the "member edit" "notes" to "|FAKE_PARAGRAPH|2"
  And I "save" the "member"
  And I go back
  # Use the search filter
  And I fill the "member list" "search" to "ZZZ"

  Then I should "see" the "member" "name" "El ZZZZorro" in the "list"
  And  I should "not see" the "member" "name" "Danilo Montes" in the "list"
