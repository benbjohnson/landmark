require 'test_helper'

class RegistrationsControllerTest < ActionController::TestCase
  test "user sign up" do
    @request.env["devise.mapping"] = Devise.mappings[:user]
    assert_difference 'ActionMailer::Base.deliveries.size', +1 do
      post :create, user: {email:'susy@gmail.com', password:'password'}
    end
    user = User.last
    sign_up_email = ActionMailer::Base.deliveries.last

    assert_equal 'susy@gmail.com', user.email
    assert_equal '[signup] susy@gmail.com', sign_up_email.subject
  end
end
