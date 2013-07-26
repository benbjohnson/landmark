require 'test_helper'

class ResourceTest < ActiveSupport::TestCase
  def test_generate_base_slug
    r0 = projects(:proj0).resources.create!(:uri => '/')
    assert_equal('home', r0.slug)
  end

  def test_generate_same_slug_on_different_projects
    r0 = projects(:proj0).resources.create!(:uri => '/index.html')
    r1 = projects(:proj1).resources.create!(:uri => '/index.html')
    assert_equal(r0.slug, r1.slug)
  end

  def test_generate_autoincrementing_slugs
    projects(:proj0).resources.create!(:uri => '/users-test')
    r0 = projects(:proj1).resources.create!(:uri => '/users-test')
    r1 = projects(:proj1).resources.create!(:uri => '/users/test')
    r2 = projects(:proj1).resources.create!(:uri => 'users_test')
    assert_equal('users-test', r0.slug)
    assert_equal('users-test-1', r1.slug)
    assert_equal('users-test-2', r2.slug)
  end

  def test_incrementing_and_aggregating_hit_counts
    h0 = projects(:proj0).resources.create!(:uri => 'X')
    h1 = projects(:proj0).resources.create!(:uri => 'Y')
    Timecop.freeze((Time.now.to_date - 8.days).to_time) do
      h0.increment_hit_count
    end
    Timecop.freeze((Time.now.to_date - 7.days).to_time) do
      h0.increment_hit_count
      h1.increment_hit_count
    end
    Timecop.freeze((Time.now.to_date - 2.days).to_time) do
      h0.increment_hit_count
      h0.increment_hit_count
    end
    h0.increment_hit_count
    assert_equal(4, h0.hit_count_within(7.days))
    assert_equal(1, h1.hit_count_within(7.days))
  end
end
