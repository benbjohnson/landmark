class HomeController < ApplicationController
  before_filter :authenticate_user!

  def index
    redirect_to project_flows_path(current_project)
  end
end
