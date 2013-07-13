require 'test_helper'

class EventsControllerTest < ActionController::TestCase
  setup do
    @account = Account.create!(:name => 'Test Account')
    @project = @account.projects.first
    @project.api_key = '123'
    @project.save!
  end

  test "should track events" do
    SkyDB::Table.any_instance.stubs(:get_properties)
    Project.any_instance.stubs(:auto_create_sky_properties)
    
    Timecop.freeze(Time.now) do
      SkyDB::Table.any_instance.expects(:add_event).with("foo", :timestamp => DateTime.now, :data => {'action' => '/index.html', 'bar' => 'baz'}).twice
      get :track, {'apiKey' => '123', 'id' => 'foo', 'properties' => {'action' => '/index.html'}.to_json, 'traits' => {'bar' => 'baz'}.to_json}
      get :track, {'apiKey' => '123', 'id' => 'foo', 'properties' => {'action' => '/index.html'}.to_json, 'traits' => {'bar' => 'baz'}.to_json}
    end

    Timecop.freeze(Time.now + 1.minute) do
      SkyDB::Table.any_instance.expects(:add_event).with("foo", :timestamp => DateTime.now, :data => {'action' => '/about.html'})
      SkyDB::Table.any_instance.expects(:add_event).with("bar", :timestamp => DateTime.now, :data => {'bar' => 'bat'})
      get :track, {'apiKey' => '123', 'id' => 'foo', 'properties' => {'action' => '/about.html'}.to_json}
      get :track, {'apiKey' => '123', 'id' => 'bar', 'traits' => {'bar' => 'bat'}.to_json}
    end

    assert_response 201
    assert_equal({"status"=>"ok"}, JSON.parse(@response.body))
    assert_equal ['/index.html', '/about.html'], @project.actions.map{|a| a.name}
  end

  test "should require API key for tracking" do
    get :track, {'id' => 'foo', 'traits' => {'bar' => 'baz'}.to_json}
    assert_response 422
  end

  test "should require identifier for tracking" do
    get :track, {'apiKey' => '123', 'traits' => {'bar' => 'baz'}.to_json}
    assert_response 422
  end

  test "should require event data for tracking" do
    get :track, {'apiKey' => '123', 'id' => 'foo'}
    assert_response 422
  end
end
