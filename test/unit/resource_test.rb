require 'test_helper'

class ResourceTest < ActiveSupport::TestCase
  test "generate same slug on different projects" do
    r0 = projects(:proj0).resources.create!(:uri => '/index.html')
    r1 = projects(:proj1).resources.create!(:uri => '/index.html')
    assert_equal(r0.slug, r1.slug)
  end

  test "generate autoincrementing slugs" do
    projects(:proj0).resources.create!(:uri => '/users-test')
    r0 = projects(:proj1).resources.create!(:uri => '/users-test')
    r1 = projects(:proj1).resources.create!(:uri => '/users/test')
    r2 = projects(:proj1).resources.create!(:uri => 'users_test')
    assert_equal('users-test', r0.slug)
    assert_equal('users-test-1', r1.slug)
    assert_equal('users-test-2', r2.slug)
  end
end
