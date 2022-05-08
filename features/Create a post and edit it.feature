# This is the test scenario name found on the README.md
Feature: Create a post and edit it

@user1 @web
Scenario: Login create a post publish it, verify it is published, edit it and publish it again
  Given I login
  And I navigate to the "post" functionality

  When I navigate to the "create post" functionality
  And I fill the "post edit" "title" to "|FAKE_TITLE|1"
  And I fill the "post edit" "content" to "|FAKE_CONTENT|1"
  And I save the post
  And I publish the post
  And I go back
  And I confirm the post is published
  And I navigate to the "edit post" functionality for the post with title "|FAKE_TITLE|1"
  And I set the "post edit" "title" to "|FAKE_TITLE|2"
  And I update the post
  And I go back

  Then I confirm the post is published with the new title
