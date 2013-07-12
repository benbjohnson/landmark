class HomeController < ApplicationController
  layout "public", :only => [:index]

  # GET /
  def index
  end

  # GET /signup
  def signup
  end
end
