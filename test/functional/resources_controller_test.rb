require 'functional/test_helper'

class ResourcesControllerTest < ActionController::TestCase
  setup do
    sky_delete_test_tables()
    setup_account()
  end

  teardown do
    sky_delete_test_tables()
  end

  def test_next_page_views
    track_page_view(@project, nil, 1, '/home')
    track_page_view(@project, nil, 1, '/signup')
    track_page_view(@project, 'john', 2, '/home')
    track_page_view(@project, 'john', 2, '/signup')
    track_page_view(@project, 'john', 2, '/welcome')
    track_page_view(@project, nil, 3, '/landing')
    track_page_view(@project, nil, 3, '/home')
    track_page_view(@project, nil, 1, '/home')
    track_page_view(@project, nil, 1, '/about')

    sign_in(@user)
    get :next_page_views, {'apiKey' => @project.api_key, 'name' => '/home'}
    assert_response 200
    assert_equal([
      {"name"=>"/signup", "count"=>2},
      {"name"=>"/about", "count"=>1}
      ],
      JSON.parse(response.body)
    )
  end

  def test_next_page_views_with_no_events
    sign_in(@user)
    get :next_page_views, {'apiKey' => @project.api_key, 'name' => '/no_such_page'}
    assert_response 200
    assert_equal([], JSON.parse(response.body))
  end

  def test_next_page_views_without_login
    get :next_page_views, {'apiKey' => @project.api_key, 'name' => '/home'}
    assert_response 401
    assert(response.body.blank?)
  end

  def test_next_page_views_for_unauthorized_project
    sign_in(@user)
    get :next_page_views, {'apiKey' => 'xxxx', 'name' => '/home'}
    assert_response 404
    assert(response.body.blank?)
  end
end
