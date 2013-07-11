require 'test_helper'

class ProjectTest < ActiveSupport::TestCase
  test "should autogenerate API key on project creation" do
    SecureRandom.expects(:hex).returns("0000000000000000")
    assert "0000000000000000", Project.create!(:name => 'Foo').api_key
  end
end
