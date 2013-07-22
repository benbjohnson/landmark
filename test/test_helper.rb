# encoding: UTF-8

ENV["RAILS_ENV"] = "test"

require 'simplecov'
SimpleCov.start 'rails'

require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

require 'webmock/test_unit'
WebMock.disable_net_connect!(:allow_localhost => true)

class ActionController::TestCase
  include Devise::TestHelpers
end

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.(yml|csv) for all tests in alphabetical order.
  #
  # Note: You'll currently still have to declare fixtures explicitly in integration tests
  # -- they do not yet inherit this setting
  fixtures :all

  def assert_mail(exp, act)
    exp = exp.encoded.gsub(/Message-ID: <.+>/, '').gsub(/Date: .+/, '')
    act = act.encoded.gsub(/Message-ID: <.+>/, '').gsub(/Date: .+/, '')
    if exp == act
      assert true
    else
      print diff(exp, act)
      fail("Mail does not match")
    end
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