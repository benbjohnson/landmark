class ActionsController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_project
  respond_to :html, :json

  # GET /actions
  def index
    @actions = @project.actions.fuzzy_search(params[:q])
    respond_with(@actions.page(params[:page]))
  end


  private

  def find_project
    @project = current_account.projects.find(params[:project_id])
    set_current_project(@project)
  end
end
