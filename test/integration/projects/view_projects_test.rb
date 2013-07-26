require 'integration/test_helper'

class ViewProjectsTest < ActionDispatch::IntegrationTest
  setup do
    sky_delete_test_tables()
    setup_account()
  end

  def test_view_projects
    login(@user.email)
    @user.account.projects.create!(:name => 'My Project')

    click_link('Projects')
    projects = @user.account.projects.order(:name)
    table = <<-BLOCK.unindent
      Project Name | API Key                         
      (Default)    | #{projects[0].api_key}
      My Project   | #{projects[1].api_key}
    BLOCK
    assert_string(table, table_text(find('#projects')))
  end
end
