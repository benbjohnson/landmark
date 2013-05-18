require 'test_helper'

class AccountTest < ActiveSupport::TestCase
  test "should autogenerate API key on account creation" do
    SecureRandom.expects(:hex).returns("0000000000000000")
    assert "0000000000000000", Account.create!(:name => 'Foo').api_key
  end
end
