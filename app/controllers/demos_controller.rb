class DemosController < ApplicationController
  def show
    user = User.find_by_authentication_token(params[:id])
    sign_in_and_redirect(:user, user)
  end
end
