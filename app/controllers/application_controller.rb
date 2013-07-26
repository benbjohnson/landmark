class ApplicationController < ActionController::Base
  include ApplicationHelper
  protect_from_forgery

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
