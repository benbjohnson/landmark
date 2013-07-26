# encoding: UTF-8
require 'test_helper'
require 'capybara/rails'
require 'capybara/poltergeist'

class ActionDispatch::IntegrationTest
  include Capybara::DSL

  def setup_account()
    @account = Account.create!()
    @project = @account.projects.first
    @user = User.new(:email => 'test@skylandlabs.com', :password => 'password')
    @user.account = @account
    @user.save!
  end

  def login(email, password='password')
    visit('/users/sign_in')
    within("#new_user") do
      fill_in('Email', :with => email)
      fill_in('Password', :with => password)
    end
    click_button('Sign in')
  end

  def track(project, id, t, traits={}, properties={})
    url = "/track?"
    url += "apiKey=#{project.api_key}"
    url += "&id=#{URI.encode(id.to_s)}" unless id.blank?
    url += "&t=#{URI.encode(t.to_s)}" unless t.blank?
    url += "&properties=#{URI.encode(properties.to_json)}"
    url += "&traits=#{URI.encode(traits.to_json)}"
    visit(url)
  end

  def track_page_view(project, id, t, path, traits={}, properties={})
    uri = path.to_s.gsub(/\/(\d+|\d+-[^\/#]+)(?=\/|#|$)/, "/:id")
    properties = properties.merge({
      '__channel__' => 'web',
      '__uri__' => uri,
      '__path__' => path,
      '__channel__' => 'web',
      })
    track(project, id, t, traits, properties)
  end
end
