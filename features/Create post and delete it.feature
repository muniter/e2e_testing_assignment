# This is the test scenario name found on the README.md
Feature: Create post and delete it

@user1 @web
Scenario: Login create a post, publish it and validate it on the front-end then delete it and validate it is not on the front-end
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
  And I delete the "post"

  Then I confirm the post is not published
