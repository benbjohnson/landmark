require 'spec_helper'

describe AccountMailer do
  before do
    @account = create(:account)
  end

  it 'sends a sign up email' do
    AccountMailer.sign_up(@account).deliver
    email = ActionMailer::Base.deliveries.first
    expect(ActionMailer::Base.deliveries.length).to eq(1)
    expect(email.from).to eq(["help@landmark.io"])
    expect(email.to).to eq(["admin@landmark.io"])
    expect(email.subject).to eq("[signup] #{@account.users.first.email}")
  end
end
