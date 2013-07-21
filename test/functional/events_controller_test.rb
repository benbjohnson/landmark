require 'test_helper'

class EventsControllerTest < ActionController::TestCase
  setup do
    SkyDB::Table.any_instance.stubs(:get_properties)
    Project.any_instance.stubs(:auto_create_sky_properties)

    @account = Account.create!(:name => 'Test Account')
    @project = @account.projects.first
    @project.api_key = '123'
    @project.save!
  end

  test "should track events" do
    SkyDB::Table.any_instance.stubs(:merge_objects)

    Timecop.freeze(Time.now) do
      SkyDB::Table.any_instance.expects(:add_event).with("foo", :timestamp => DateTime.now, :data => {'__channel__' => 'web', '__uri__' => '/index.html', 'bar' => 'baz', '__anonymous__' => false}).twice
      get :track, {'apiKey' => '123', 'id' => 'foo', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__uri__' => '/index.html'}.to_json, 'traits' => {'bar' => 'baz'}.to_json}
      get :track, {'apiKey' => '123', 'id' => 'foo', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__uri__' => '/index.html'}.to_json, 'traits' => {'bar' => 'baz'}.to_json}
    end

    Timecop.freeze(Time.now + 1.minute) do
      SkyDB::Table.any_instance.expects(:add_event).with("foo", :timestamp => DateTime.now, :data => {'__channel__' => 'web', '__uri__' => '/about.html', '__anonymous__' => false})
      SkyDB::Table.any_instance.expects(:add_event).with("bar", :timestamp => DateTime.now, :data => {'bar' => 'bat', '__anonymous__' => false})
      get :track, {'apiKey' => '123', 'id' => 'foo', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__uri__' => '/about.html'}.to_json}
      get :track, {'apiKey' => '123', 'id' => 'bar', 't' => 'xxxx', 'traits' => {'bar' => 'bat'}.to_json}
    end

    assert_response 201
    assert_equal({"status"=>"ok"}, JSON.parse(@response.body))

    resources = @project.resources.order(:id)
    assert_equal(2, resources.count)
    assert_equal('web', resources[0].channel)
    assert_equal('/index.html', resources[0].uri)
    assert_equal(2, resources[0].hit_count_within(1.day))
    assert_equal('web', resources[1].channel)
    assert_equal('/about.html', resources[1].uri)
    assert_equal(1, resources[1].hit_count_within(1.day))
  end

  test "should track anonymous events" do
    Timecop.freeze(Time.now) do
      SkyDB::Table.any_instance.expects(:add_event).with("~xxxx", :timestamp => DateTime.now, :data => {'__channel__' => 'web', '__uri__' => '/index.html', '__anonymous__' => true})
      get :track, {'apiKey' => '123', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__uri__' => '/index.html'}.to_json}
    end
  end

  test "should merge anonymous events with known user" do
    Timecop.freeze(Time.now) do
      SkyDB::Table.any_instance.expects(:add_event).with("~xxxx", :timestamp => DateTime.now, :data => {'__channel__' => 'web', '__uri__' => '/index.html', '__anonymous__' => true})
      get :track, {'apiKey' => '123', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__uri__' => '/index.html'}.to_json}
    end

    Timecop.freeze(Time.now) do
      SkyDB::Table.any_instance.expects(:merge_objects).with("bob", "~xxxx")
      SkyDB::Table.any_instance.expects(:add_event).with("bob", :timestamp => DateTime.now, :data => {'__channel__' => 'web', '__uri__' => '/about-us.html', '__anonymous__' => false})
      get :track, {'apiKey' => '123', 'id' => 'bob', 't' => 'xxxx', 'properties' => {'__channel__' => 'web', '__uri__' => '/about-us.html'}.to_json}
    end
  end
  
  test "should require API key for tracking" do
    get :track, {'id' => 'foo', 'traits' => {'bar' => 'baz'}.to_json}
    assert_response 422
  end

  test "should require identifier or tracking id for tracking" do
    get :track, {'apiKey' => '123', 'traits' => {'bar' => 'baz'}.to_json}
    assert_response 422
  end

  test "should require event data for tracking" do
    get :track, {'apiKey' => '123', 'id' => 'foo'}
    assert_response 422
  end
end
