FactoryGirl.define do
  sequence :email do |n|
    "#{n}@landmark.io"
  end

  factory :account do
    after(:create) do |account, evaluator|
      account.users.create(attributes_for(:user))
    end
  end

  factory :project do
    account
  end

  factory :user do
    email
    password "password"
  end
end
