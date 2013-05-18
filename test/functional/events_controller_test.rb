require 'test_helper'

class EventsControllerTest < ActionController::TestCase
  setup do
    @account = Account.create!(:name => 'Test Account')
    @account.api_key = '123'
    @account.save!
  end

  test "should track events" do
    Timecop.freeze(Time.now) do
      SkyDB::Table.any_instance.expects(:add_event).with("foo", :timestamp => DateTime.now, :data => {'action' => '/index.html', 'bar' => 'baz'}).twice
      post :track, {'apiKey' => '123', 'id' => 'foo', '_action' => '/index.html', 'bar' => 'baz'}, "CONTENT_TYPE" => "application/json"
      post :track, {'apiKey' => '123', 'id' => 'foo', '_action' => '/index.html', 'bar' => 'baz'}, "CONTENT_TYPE" => "application/json"
    end

    Timecop.freeze(Time.now + 1.minute) do
      SkyDB::Table.any_instance.expects(:add_event).with("foo", :timestamp => DateTime.now, :data => {'action' => '/about.html'})
      SkyDB::Table.any_instance.expects(:add_event).with("bar", :timestamp => DateTime.now, :data => {'bar' => 'bat'})
      post :track, {'apiKey' => '123', 'id' => 'foo', '_action' => '/about.html'}, "CONTENT_TYPE" => "application/json"
      post :track, {'apiKey' => '123', 'id' => 'bar', 'bar' => 'bat'}, "CONTENT_TYPE" => "application/json"
    end

    assert_response 201
    assert_equal({"status"=>"ok"}, JSON.parse(@response.body))
    assert_equal ['/index.html', '/about.html'], @account.actions.map{|a| a.name}
  end

  test "should require API key for tracking" do
    post :track, {'id' => 'foo', 'bar' => 'baz'}, "CONTENT_TYPE" => "application/json"
    assert_response 422
  end

  test "should require identifier for tracking" do
    post :track, {'apiKey' => '123', 'bar' => 'baz'}, "CONTENT_TYPE" => "application/json"
    assert_response 422
  end

  test "should require event data for tracking" do
    post :track, {'apiKey' => '123', 'id' => 'foo'}, "CONTENT_TYPE" => "application/json"
    assert_response 422
  end
end
