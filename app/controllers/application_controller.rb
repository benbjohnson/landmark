class ApplicationController < ActionController::Base
  include ApplicationHelper
  protect_from_forgery

  def find_project(id)
    @project = current_account.projects.where(:id => id).first
    @project ||= current_project
    set_current_project(@project)
  end
end
