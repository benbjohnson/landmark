require 'functional/test_helper'

class EventsControllerTest < ActionController::TestCase
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

  def test_track_anonymous_events
    Timecop.freeze(DateTime.iso8601('2000-01-01T00:00:00Z')) do
      get :track, {'apiKey' => '123', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__resource__' => '/index.html'}.to_json}
    end
    assert_response 201
  end

  def test_merge_anonymous_events_with_known_user
    Timecop.freeze(DateTime.iso8601('2000-01-01T00:00:00Z')) do
      get :track, {'apiKey' => '123', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__resource__' => '/index.html'}.to_json}
      assert_response 201
    end

    Timecop.freeze(DateTime.iso8601('2000-01-01T00:01:00Z')) do
      get :track, {'apiKey' => '123', 'id' => 'bob', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__resource__' => '/about-us.html'}.to_json}
      assert_response 201
    end
  end
  
  def test_require_api_key
    get :track, {'id' => 'foo', 'traits' => {'bar' => 'baz'}.to_json}
    assert_response 422
  end

  def test_require_identifier_or_tracking_id
    get :track, {'apiKey' => '123', 'traits' => {'bar' => 'baz'}.to_json}
    assert_response 422
  end

  def test_require_event_data
    get :track, {'apiKey' => '123', 'id' => 'foo'}
    assert_response 422
  end
end
