class PropertiesController < ApplicationController
  before_filter :authenticate_user!

  # GET /properties
  def index
    @properties = current_account.properties
  end

  # GET /properties/:name
  def show
  end

  # GET /properties/new
  def new
    @property = SkyDB::Property.new
  end

  # POST /properties
  def create
    @property = current_account.sky_table.create_property(
      :name => params[:name],
      :transient => true,
      :data_type => params[:data_type]
    )
    redirect_to properties_path
  end

  # DELETE /properties/:id
  def destroy
    table = current_account.sky_table
    @property = table.get_property(params[:id])
    table.delete_property(@property)
    redirect_to properties_path
  end
end
