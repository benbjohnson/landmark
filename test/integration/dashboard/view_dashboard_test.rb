require 'integration/test_helper'

class ViewDashboardTest < ActionDispatch::IntegrationTest
  setup do
    sky_delete_test_tables()
    setup_account()
  end

  def test_view_uninitialized_dashboard
    login(@user.email)
    assert page.has_content?("Getting Started")
  end

  def test_view_initialized_dashboard
    track_page_view(@project, nil, 1, '/users/123')
    login(@user.email)
    assert page.has_content?("Welcome")
  end
end
