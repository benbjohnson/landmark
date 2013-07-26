require 'test_helper'

class ProjectTest < ActiveSupport::TestCase
  def test_autogenerate_api_key
    SecureRandom.expects(:hex).returns("0000000000000000")
    assert "0000000000000000", Project.create!(:name => 'Foo').api_key
  end

  def test_initialize_properties do
    project = Project.create!(:name => 'Foo')
    project.sky_table.expects(:create_property).with(:name => 'state', :transient => true, :data_type => 'factor')
    project.sky_table.expects(:create_property).with(:name => 'age', :transient => true, :data_type => 'float')

    project.auto_create_sky_properties(
      [SkyDB::Property.new(:name => 'foo', :transient => false, :data_type => 'string')],
      true,
      {'foo' => 'bar', 'state' => 'CO', 'age' => 12, '' => 'bad_key', nil => 'bad_key'}
    )

    project.sky_table.expects(:create_property).with(:name => 'isMale', :transient => false, :data_type => 'boolean')
    project.sky_table.expects(:create_property).with(:name => 'isFemale', :transient => false, :data_type => 'boolean')
    project.auto_create_sky_properties([], false, {'isMale' => true, 'isFemale' => false})
  end
end
