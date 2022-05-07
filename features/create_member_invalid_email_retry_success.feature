Feature: Login, Create Member, Edit Member.

@user1 @web
Scenario: Login and create a member, then edit it with an invalid email, see that it fails, try again providing a valid email, see that it succeeds.
  Given I login
  And I navigate to the "member" functionality

  When I navigate to the "create member" functionality
  And I fill the "member edit" "name" to "|FAKE_NAME|1"
  And I fill the "member edit" "email" to "invalidemail"
  And I fill the "member edit" "notes" to "|FAKE_PARAGRAPH|1"
  And I "save" the "member"
  And I should see member saving failed
  And I set the "member edit" "email" to "|FAKE_EMAIL|2"
  And I "retry save" the "member"
  And I go back

  Then I should "see" the "member" "email" "|FAKE_EMAIL|2" in the "list"
