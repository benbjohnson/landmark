class PropertiesController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_project

  # GET /projects/:project_id/properties
  def index
    @properties = @project.properties
  end

  # GET /projects/:project_id/properties/:name
  def show
  end

  # GET /projects/:project_id/properties/new
  def new
    @property = SkyDB::Property.new
  end

  # POST /projects/:project_id/properties
  def create
    @property = @project.sky_table.create_property(
      :name => params[:name],
      :transient => true,
      :data_type => params[:data_type]
    )
    redirect_to project_properties_path(@project)
  end

  # DELETE /projects/:project_id/properties/:id
  def destroy
    table = @project.sky_table
    @property = table.get_property(params[:id])
    table.delete_property(@property)
    redirect_to project_properties_path(@project)
  end


  private
  
  def find_project
    @project = current_account.projects.find(params[:project_id])
    set_current_project(@project)
  end
end
