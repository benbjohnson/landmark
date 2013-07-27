# encoding: UTF-8

ENV["RAILS_ENV"] = "test"

require 'simplecov'
SimpleCov.start 'rails'

require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

require 'webmock/test_unit'
WebMock.disable_net_connect!(:allow_localhost => true)

class ActiveSupport::TestCase
  fixtures :all

  def assert_mail(exp, act, failure_message=nil)
    exp = exp.encoded.gsub(/Message-ID: <.+>/, '').gsub(/Date: .+/, '')
    act = act.encoded.gsub(/Message-ID: <.+>/, '').gsub(/Date: .+/, '')
    assert_string(exp, act, failure_message)
  end

  def assert_string(exp, act, failure_message=nil)
    assert(exp == act, message(failure_message) { diff(exp, act) unless exp == act })
  end
end

module SkyTestHelper
  def sky_client
    SkyDB::Client.new(:host => 'localhost', :port => 8585)
  end

  def sky_delete_test_tables
    client = sky_client
    client.get_tables.each do |table|
      client.delete_table(table) unless table.name.index(/^landmark-test/).nil?
    end
  end
end
