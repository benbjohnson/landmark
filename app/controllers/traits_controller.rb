class TraitsController < ApplicationController
  before_filter :authenticate_user!

  # GET /traits
  def index
    @traits = current_account.traits
  end

  # GET /traits/:name
  def show
  end

  # GET /traits/new
  def new
    @trait = SkyDB::Property.new
  end

  # POST /traits
  def create
    @trait = current_account.sky_table.create_property(
      :name => params[:name],
      :transient => false,
      :data_type => params[:data_type]
    )
    redirect_to traits_path
  end

  # DELETE /traits/:id
  def destroy
    table = current_account.sky_table
    @trait = table.get_property(params[:id])
    table.delete_property(@trait)
    redirect_to traits_path
  end
end
