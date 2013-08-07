require 'functional/test_helper'

class Api::V1::FlowsControllerTest < ActionController::TestCase
  setup do
    sky_delete_test_tables()
    setup_account()
    @flow = @project.flows.create!(:name => 'foo')
  end

  teardown do
    sky_delete_test_tables()
  end

  def test_next_page_actions
    @flow.steps.create!(resource: '/home')
    @flow.steps.create!(resource: '/signup')

    Timecop.freeze(10.minute.ago) do
      track_page_view(@project, nil, 1, '/home')
      track_page_view(@project, nil, 2, '/home')
      track_page_view(@project, nil, 3, '/signup')
      track_page_view(@project, nil, 4, '/about')
    end
    Timecop.freeze(9.minutes.ago) do
      track_page_view(@project, nil, 1, '/signup')
      track_page_view(@project, nil, 2, '/about')
      track_page_view(@project, nil, 3, '/home')
      track_page_view(@project, nil, 4, '/home')
    end
    Timecop.freeze(8.minute.ago) do
      track_page_view(@project, nil, 4, '/pricing')
    end
    Timecop.freeze(7.minute.ago) do
      track_page_view(@project, nil, 4, '/signup')
    end

    sign_in(@user)
    get :query, {'apiKey' => @project.api_key, 'id' => @flow.id}
    assert_response 200
    assert_equal(
      {"0"=>{"count"=>4}, "1"=>{"count"=>2}},
      JSON.parse(response.body)
    )
  end
end
