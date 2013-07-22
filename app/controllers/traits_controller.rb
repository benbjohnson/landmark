class TraitsController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_project

  # GET /projects/:project_id/traits
  def index
    @traits = @project.traits
  end

  # GET /projects/:project_id/traits/:name
  def show
  end

  # DELETE /projects/:project_id/traits/:id
  def destroy
    table = @project.sky_table
    @trait = table.get_property(params[:id])
    table.delete_property(@trait)
    redirect_to project_traits_path(@project)
  end


  private
  
  def find_project
    @project = current_account.projects.find(params[:project_id])
    set_current_project(@project)
  end
end
