class HomeController < ApplicationController
  layout "public", :only => [:index]
  before_filter :check_signed_in

  # GET /
  def index
  end

  # GET /signup
  def signup
  end

  # GET /pause
  def pause
    sleep(1)
    head 200
  end


  private
  
  def check_signed_in
    if user_signed_in?
      redirect_to(project_path(current_project))
    end
  end
end
