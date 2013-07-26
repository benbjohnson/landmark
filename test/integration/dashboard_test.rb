require 'integration/test_helper'

class DashboardTest < ActionDispatch::IntegrationTest
  include SkyTestHelper

  setup do
    sky_delete_test_tables()
    setup_account()
  end

  def test_show_uninitialized_dashboard
    login(@user.email)
    assert page.has_content?("Getting Started")
  end

  def test_show_initialized_dashboard
    track_page_view(@project, nil, 1, '/users/123')
    track_page_view(@project, nil, 2, '/')
    track_page_view(@project, nil, 2, '/signup')
    track_page_view(@project, 'john', 2, '/users/123')
    track_page_view(@project, 'john', 2, '/users/123')
    login(@user.email)

    assert page.has_content?("Dashboard")
    within('#top-pages table') do
      tr = all('tbody tr')
      assert_equal(3, tr.length)
      assert_equal("/users/:id 3", tr[0].text)
      assert_equal("/signup 1", tr[1].text)
      assert_equal("/ 1", tr[2].text)
    end
  end
end