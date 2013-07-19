require 'test_helper'

class AccountMailerTest < ActionMailer::TestCase
  tests AccountMailer

  test "sign up" do
    account = accounts(:basic)
    @expected.from = 'help@landmark.io'
    @expected.to = 'admin@landmark.io'
    @expected.subject = '[signup] joe@noreply.com'
    @expected.content_type = 'text/html'
    @expected.body = read_fixture('sign_up.html')

    assert_mail(@expected, AccountMailer.sign_up(account))
  end
end