require 'functional/test_helper'

class Api::V1::StatesControllerTest < ActionController::TestCase
  setup do
    sky_delete_test_tables()
    setup_account()
  end

  teardown do
    sky_delete_test_tables()
  end

  # Ensure that we can query for basic state transitions.
  def test_query
    fixture1()
    sign_in(@user)
    get :query, {'apiKey' => @project.api_key}
    assert_response 200
    assert_string(
      readfixture('api/v1/states_controller/query.json').chomp,
      JSON.pretty_generate(remove_layout(JSON.parse(response.body)))
      )
  end

  # Ensure that we can query for state transition replay.
  def test_query_replay_from
    fixture1()
    sign_in(@user)
    get :query, {'apiKey' => @project.api_key, :replay_from => @visited.id, duration:"5"}
    assert_response 200
    assert_string(
      readfixture('api/v1/states_controller/query_replay_from.json').chomp,
      JSON.pretty_generate(remove_layout(JSON.parse(response.body)))
      )
  end

  private

  def remove_layout(obj)
    obj.delete_if {|k,v| !%w(width height).index(k).nil?}
    obj["states"].each {|s| s.delete_if {|k,v| !%w(x y width height label_x label_y).index(k).nil?}}
    obj["transitions"].each {|s| s.delete_if {|k,v| !%w(d arrowhead).index(k).nil?}}
    obj
  end

  def fixture1
    ActiveRecord::Base.connection.reset_pk_sequence!("states")

    @visited = @project.states.create!(name: "Visited")
    @registered = @project.states.create!(name: "Registered", expression: "__anonymous__ == false")
    @registered.sources << @visited
    @trial = @project.states.create!(name: "Trialing", expression: "__action__ == '__page_view__' && __resource__ == '/start_trial'")
    @trial.sources << @registered

    Timecop.freeze(DateTime.iso8601("2012-01-01T00:00:00Z")) do
      track_page_view(@project, nil, 1, '/home')
      track_page_view(@project, nil, 2, '/home')
      track_page_view(@project, "jim", 3, '/register')
      track_page_view(@project, nil, 4, '/home')
    end
    Timecop.freeze(DateTime.iso8601("2012-01-02T00:00:00Z")) do
      track_page_view(@project, nil, 1, '/pricing')
      track_page_view(@project, nil, 2, '/pricing')
    end
    Timecop.freeze(DateTime.iso8601("2012-01-03T00:00:00Z")) do
      track_page_view(@project, "john", 1, '/register')
    end
    Timecop.freeze(DateTime.iso8601("2012-01-04T00:00:00Z")) do
      track_page_view(@project, "john", 1, '/start_trial')
      track_page_view(@project, "susy", 2, '/register')
    end
  end
end
