require 'integration/test_helper'

class AddProjectTest < ActionDispatch::IntegrationTest
  setup do
    sky_delete_test_tables()
    setup_account()
  end

  def test_add_project
    login(@user.email)

    # Go to Projects > Add Project and create a new project.
    click_link('Projects')
    click_link('Add Project')
    fill_in('Name', :with => 'My Project')
    click_button('Create Project')

    # Verify that we see the getting started page for our project.
    assert page.has_content?("Getting Started")
    assert page.has_content?(Project.last.api_key)
  end
end
