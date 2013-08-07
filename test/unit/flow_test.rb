require 'test_helper'

class FlowTest < ActiveSupport::TestCase
  include SkyTestHelper
  
  setup do
    sky_delete_test_tables()
    @flow = projects(:proj0).flows.create!(:name => 'foo')
  end

  def test_empty_query
    assert_equal({:sessionIdleTime=>7200, :steps=>[]}, @flow.query)
  end

  def test_multistep_query
    @flow.steps.create!(resource: '/index.html')
    @flow.steps.create!(resource: '/signup.html')
    assert_equal(
      {:sessionIdleTime=>7200,
       :steps=>
        [{:type=>"condition",
          :expression=>
           "__resource__ == '/index.html' && __action__ == '__page_view__'",
          :steps=>
           [{:type=>"selection",
             :name=>"0",
             :dimensions=>[],
             :fields=>[{:name=>"count", :expression=>"count()"}]},
            {:type=>"condition",
             :expression=>
              "__resource__ == '/signup.html' && __action__ == '__page_view__'",
             :steps=>
              [{:type=>"selection",
                :name=>"1",
                :dimensions=>[],
                :fields=>[{:name=>"count", :expression=>"count()"}]}]}]}]},
    @flow.query)
  end
end
