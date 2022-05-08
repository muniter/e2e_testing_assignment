# This is the test scenario name found on the README.md
Feature: Create post without content

@user1 @web
Scenario: Login create a post without content, try publishig it and validate it does on the front-end
  Given I login
  And I navigate to the "post" functionality

  When I navigate to the "create post" functionality
  And I fill the "post edit" "title" to "|FAKE_TITLE|1"
  And I save the post
  And I publish the post "|FAKE_TITLE|1"
  And I go back

  Then I confirm the post is published
