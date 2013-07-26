require 'test_helper'

class UserFlowsTest < ActionDispatch::IntegrationTest
  include SkyTestHelper

  setup do
    sky_delete_test_tables()
    @account = Account.create!()
    @user = User.new(:email => 'test@skylandlabs.com', :password => 'password')
    @user.account = @account
    @user.save!
  end

  test "show_dashboard" do
    login(@user.email)
  end

  def login(email, password='password')
    visit('/users/sign_in')
    within("#new_user") do
      fill_in('Email', :with => email)
      fill_in('Password', :with => password)
    end
    click_button('Sign in')
  end
end