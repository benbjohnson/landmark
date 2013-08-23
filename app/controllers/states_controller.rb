class StatesController < ApplicationController
  before_filter :authenticate_user!
  before_filter lambda{ find_project(params[:project_id]); true  }
  respond_to :html
  
  # GET /projects/:id/states
  def index
    @states = @project.states
  end
end
