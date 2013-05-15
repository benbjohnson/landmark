require 'test_helper'

class EventsControllerTest < ActionController::TestCase
  setup do
    @account = Account.create!(:name => 'Test Account')
    @account.api_key = '123'
    @account.save!
  end

  test "should track events" do
    Timecop.freeze(Time.now) do
      SkyDB::Table.any_instance.expects(:add_event).with("foo", DateTime.now, {'action' => '/index.html', 'bar' => 'baz'}).twice
      post :track, {'api_key' => '123', 'id' => 'foo', 'event' => {'action' => '/index.html', 'bar' => 'baz'}}, "CONTENT_TYPE" => "application/json"
      post :track, {'api_key' => '123', 'id' => 'foo', 'event' => {'action' => '/index.html', 'bar' => 'baz'}}, "CONTENT_TYPE" => "application/json"
    end

    Timecop.freeze(Time.now + 1.minute) do
      SkyDB::Table.any_instance.expects(:add_event).with("foo", DateTime.now, {'action' => '/about.html'})
      SkyDB::Table.any_instance.expects(:add_event).with("bar", DateTime.now, {'bar' => 'bat'})
      post :track, {'api_key' => '123', 'id' => 'foo', 'event' => {'action' => '/about.html'}}, "CONTENT_TYPE" => "application/json"
      post :track, {'api_key' => '123', 'id' => 'bar', 'event' => {'bar' => 'bat'}}, "CONTENT_TYPE" => "application/json"
    end

    assert_response 201
    assert_equal({"status"=>"ok"}, JSON.parse(@response.body))
    assert_equal ['/index.html', '/about.html'], @account.actions.map{|a| a.name}
  end

  test "should require API key for tracking" do
    post :track, {'id' => 'foo', 'event' => {'bar' => 'baz'}}, "CONTENT_TYPE" => "application/json"
    assert_response 422
  end

  test "should require identifier for tracking" do
    post :track, {'api_key' => '123', 'event' => {'bar' => 'baz'}}, "CONTENT_TYPE" => "application/json"
    assert_response 422
  end

  test "should require event data for tracking" do
    post :track, {'api_key' => '123', 'id' => 'foo'}, "CONTENT_TYPE" => "application/json"
    assert_response 422
  end
end
