class ActionsController < ApplicationController
  before_filter :authenticate_user!
  before_filter lambda{ find_project(params[:project_id]); true  }
  respond_to :html

  # GET /projects/:project_id/actions
  def index
  end
end
