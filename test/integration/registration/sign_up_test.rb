require 'integration/test_helper'

class SignUpTest < ActionDispatch::IntegrationTest
  setup do
    sky_delete_test_tables()
  end

  def test_sign_up
    assert_difference 'ActionMailer::Base.deliveries.size', +1 do
      visit('/users/sign_up')
      within("#new_user") do
        fill_in('Email', :with => 'ben@skylandlabs.com')
        fill_in('Password', :with => 'password')
        fill_in('Confirm Password', :with => 'password')
      end
      click_button('Sign up')

      user = User.last
      assert_equal('ben@skylandlabs.com', user.email)
      refute_nil(user.account)
      assert_equal(1, user.account.projects.count)
      assert_equal("/projects/#{user.account.projects.first.id}", current_path)
    end

    sign_up_email = ActionMailer::Base.deliveries.last
    assert_equal '[signup] ben@skylandlabs.com', sign_up_email.subject
  end

  def test_sign_up_with_duplicate_email
    visit('/users/sign_up')
    within("#new_user") do
      fill_in('Email', :with => 'joe@noreply.com')
      fill_in('Password', :with => 'password')
      fill_in('Confirm Password', :with => 'password')
    end
    click_button('Sign up')
    assert_equal('Email has already been taken.', find('.alert-error').text)
  end

  def test_sign_up_with_mismatched_passwords
    visit('/users/sign_up')
    within("#new_user") do
      fill_in('Email', :with => 'john@landmark.io')
      fill_in('Password', :with => 'password')
      fill_in('Confirm Password', :with => 'does not match')
    end
    click_button('Sign up')
    assert_equal('Password doesn\'t match confirmation.', find('.alert-error').text)
  end
end
