require 'functional/test_helper'

class Api::V1::StatesControllerTest < ActionController::TestCase
  setup do
    sky_delete_test_tables()
    setup_account()
  end

  teardown do
    sky_delete_test_tables()
  end

  def test_query
    visited = @project.states.create!(name: "Visited", expression: "true")
    registered = @project.states.create!(name: "Registered", expression: "__anonymous__ == false", parent:visited)
    trial = @project.states.create!(name: "Trialing", expression: "__action__ == '__page_view__' && __resource__ == '/start_trial'", parent:registered)

    Timecop.freeze(10.minute.ago) do
      track_page_view(@project, nil, 1, '/home')
      track_page_view(@project, nil, 2, '/home')
      track_page_view(@project, "jim", 3, '/register')
      track_page_view(@project, nil, 4, '/home')
    end
    Timecop.freeze(9.minute.ago) do
      track_page_view(@project, nil, 1, '/pricing')
      track_page_view(@project, nil, 2, '/pricing')
    end
    Timecop.freeze(8.minute.ago) do
      track_page_view(@project, "john", 1, '/register')
    end
    Timecop.freeze(7.minute.ago) do
      track_page_view(@project, "john", 1, '/start_trial')
      track_page_view(@project, "susy", 2, '/register')
    end

    sign_in(@user)
    get :query, {'apiKey' => @project.api_key}
    assert_response 200
    resp = JSON.parse(response.body)
    resp.delete_if {|k,v| !%w(width height).index(k).nil?}
    resp["states"].each {|s| s.delete_if {|k,v| !%w(x y width height label_x label_y).index(k).nil?}}
    resp["transitions"].each {|s| s.delete_if {|k,v| !%w(d arrowhead).index(k).nil?}}
    assert_equal(
      {
        "states" => [
          {"id" => visited.id, "name" => "Visited", "parent_id" => nil},
          {"id" => registered.id, "name" => "Registered", "parent_id" => visited.id},
          {"id" => trial.id, "name" => "Trialing", "parent_id" => registered.id},
        ],
        "transitions" => [
          {"source" => visited.id, "target" => registered.id, "count"=>3},
          {"source" => registered.id, "target" => trial.id, "count"=>1}
        ]
      },
      resp
    )
  end
end
