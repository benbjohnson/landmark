require 'test_helper'

class EventsControllerTest < ActionController::TestCase
  include SkyTestHelper

  setup do
    sky_delete_test_tables()
    @account = Account.create!(:name => 'Test Account')
    @project = @account.projects.first
    @project.api_key = '123'
    @project.save!
  end

  teardown do
    sky_delete_test_tables()
  end

  test "track_events" do
    Timecop.freeze(DateTime.iso8601('2000-01-01T00:00:00Z')) do
      get :track, {'apiKey' => '123', 'id' => 'foo', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__uri__' => '/index.html'}.to_json, 'traits' => {'bar' => 'baz'}.to_json}
      get :track, {'apiKey' => '123', 'id' => 'foo', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__uri__' => '/index.html'}.to_json, 'traits' => {'bar' => 'baz'}.to_json}
    end

    Timecop.freeze(DateTime.iso8601('2000-01-01T00:01:00Z')) do
      get :track, {'apiKey' => '123', 'id' => 'foo', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__uri__' => '/about.html'}.to_json}
      get :track, {'apiKey' => '123', 'id' => 'bar', 't' => 'xxxx', 'traits' => {'bar' => 'bat'}.to_json}
    end

    assert_equal(
      [{
        "timestamp"=>"2000-01-01T00:00:00.000000Z",
        "data"=>{
          "__anonymous__"=>false,
          "__channel__"=>"web",
          "__uri__"=>"/index.html",
          "bar"=>"baz"}
       },
       {"timestamp"=>"2000-01-01T00:01:00.000000Z",
        "data"=>{
          "__anonymous__"=>false,
          "__channel__"=>"web",
          "__uri__"=>"/about.html"}
       }
      ], @project.sky_table.get_events("foo").map{|e| e.to_hash})

    assert_equal(
      [{"timestamp"=>"2000-01-01T00:01:00.000000Z",
        "data"=>{
          "__anonymous__"=>false,
          "bar"=>"bat"}
       }
      ], @project.sky_table.get_events("bar").map{|e| e.to_hash})

    Timecop.freeze(DateTime.iso8601('2000-01-02T00:00:00Z')) do
      resources = @project.resources.order(:id)
      assert_equal(2, resources.count)
      assert_equal('web', resources[0].channel)
      assert_equal('/index.html', resources[0].uri)
      assert_equal(2, resources[0].hit_count_within(1.day))
      assert_equal('web', resources[1].channel)
      assert_equal('/about.html', resources[1].uri)
      assert_equal(1, resources[1].hit_count_within(1.day))
    end
  end

  test "track_anonymous_events" do
    Timecop.freeze(DateTime.iso8601('2000-01-01T00:00:00Z')) do
      get :track, {'apiKey' => '123', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__uri__' => '/index.html'}.to_json}
    end
  end

  test "merge_anonymous_events_with_known_user" do
    Timecop.freeze(DateTime.iso8601('2000-01-01T00:00:00Z')) do
      get :track, {'apiKey' => '123', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__uri__' => '/index.html'}.to_json}
    end

    Timecop.freeze(DateTime.iso8601('2000-01-01T00:01:00Z')) do
      get :track, {'apiKey' => '123', 'id' => 'bob', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__uri__' => '/about-us.html'}.to_json}
    end
  end
  
  test "require_api_key" do
    get :track, {'id' => 'foo', 'traits' => {'bar' => 'baz'}.to_json}
    assert_response 422
  end

  test "require_identifier_or_tracking_id" do
    get :track, {'apiKey' => '123', 'traits' => {'bar' => 'baz'}.to_json}
    assert_response 422
  end

  test "require_event_data" do
    get :track, {'apiKey' => '123', 'id' => 'foo'}
    assert_response 422
  end
end
