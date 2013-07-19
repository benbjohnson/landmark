class AccountMailer < ActionMailer::Base
  default from: 'help@landmark.io'

  def sign_up(account)
    return if account.users.empty?

    @account = account
    @user = account.users.first
    mail(to:"admin@landmark.io", subject:"[signup] #{@user.email}")
  end
end