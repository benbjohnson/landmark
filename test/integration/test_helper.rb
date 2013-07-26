# encoding: UTF-8
require 'test_helper'
require 'capybara/rails'
require 'capybara/poltergeist'

class ActionDispatch::IntegrationTest
  include Capybara::DSL
  include SkyTestHelper

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
      '__resource__' => uri,
      '__path__' => path,
      '__channel__' => 'web',
      })
    track(project, id, t, traits, properties)
  end

  def table_text(table)
    output = table.all("tr").map {|tr| tr.all("td,th").map {|td| td.text.to_s}}

    column_widths = []
    output.each do |row|
      row.each_with_index do |cell, col|
        column_widths[col] = [cell.length, column_widths[col].to_i].max
      end
    end

    output.each do |row|
      row.each_with_index do |cell, col|
        row[col] = "%-#{column_widths[col]}s" % [cell]
      end
    end

    return output.map{|row| row.join(" | ")}.join("\n") + "\n"
  end
end
