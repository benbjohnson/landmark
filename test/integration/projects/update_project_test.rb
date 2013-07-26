require 'integration/test_helper'

class UpdateProjectTest < ActionDispatch::IntegrationTest
  setup do
    sky_delete_test_tables()
    setup_account()
  end

  def test_update_project
    login(@user.email)
    project = @user.account.projects.create!(:name => 'My Project')

    # Go to Projects, click on project and update.
    click_link('Projects')
    within('#projects') do
      click_link('My Project')
    end
    fill_in('Name', :with => 'Awesome Project')
    click_button('Update Project')
    
    project.reload
    assert_equal('Awesome Project', project.name)
  end
end
