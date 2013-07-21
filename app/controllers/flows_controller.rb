class FlowsController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_project

  # GET /projects/:id/flows
  def index
    @has_resources = @project.has_resources?
  end

  # GET /projects/:id/flows/view
  def view
    return redirect_to project_flows_path(@project) if params[:id].nil?

    name = params[:id] + (params[:format].blank? ? "" : ".#{params[:format]}")
    @action = @project.resources.find_by_name(name)
    @properties = @project.sky_table.get_properties()
    
    # Redirect to home page if the action isn't found.
    return redirect_to project_flows_path(@project) if @action.nil?
  end


  private
  
  def find_project
    @project = current_account.projects.find(params[:project_id])
    set_current_project(@project)
  end
end
