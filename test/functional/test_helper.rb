require 'test_helper'

class ActionController::TestCase
  include SkyTestHelper
  include Devise::TestHelpers

  def setup_account()
    @account = Account.create!()
    @project = @account.projects.first
    @user = User.new(:email => 'test@skylandlabs.com', :password => 'password')
    @user.account = @account
    @user.save!
  end

  def track(project, id, t, traits={}, properties={})
    properties.merge!({'__anonymous__' => id.blank?})
    id = t.to_s if id.blank?
    project.track(id, traits, properties)
  end

  def track_page_view(project, id, t, path, traits={}, properties={})
    resource = path.to_s.gsub(/\/(\d+|\d+-[^\/#]+)(?=\/|#|$)/, "/:id")
    properties = properties.merge({
      '__channel__' => 'web',
      '__resource__' => resource,
      '__path__' => path,
      '__channel__' => 'web',
      })
    track(project, id, t, traits, properties)
  end
end
