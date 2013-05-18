class ApplicationController < ActionController::Base
  protect_from_forgery

  def current_account
    return current_user ? current_user.account : nil
  end
end
