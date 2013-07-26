class ApplicationController < ActionController::Base
  include ApplicationHelper
  protect_from_forgery

  def find_project(id)
    @project = current_account.projects.where(:id => id).first
    @project ||= current_project
    set_current_project(@project)
  end

  def encode_lua_string(str)
    str.to_s.gsub(/\n|\f|\t|"|'|\\/) do |m|
      case m
      when "\n" then "\\n"
      when "\f" then "\\f"
      when "\t" then "\\t"
      when "\"" then "\\\""
      when "'" then "\\'"
      end
    end
  end
end
