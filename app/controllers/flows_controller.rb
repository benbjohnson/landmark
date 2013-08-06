class FlowsController < ApplicationController
  before_filter :authenticate_user!
  before_filter lambda{ find_project(params[:project_id]); true  }
  respond_to :html
  
  # GET /flows
  def index
    @flows = @project.flows.includes(:steps)
  end

  # GET /flows/1
  def show
    @flow = @project.flows.includes(:steps).find(params[:id])
  end

  # GET /flows/new
  def new
    @flow = @project.flows.build
  end

  # GET /flows/1/edit
  def edit
    @flow = @project.flows.find(params[:id])
  end

  # POST /flows
  def create
    @flow = @project.flows.build(params[:flow])

    if @flow.save
      redirect_to @flow, notice: 'Flow was successfully created.'
    else
      render action: "new"
    end
  end

  # PUT /flows/1
  def update
    @flow = @project.flows.find(params[:id])

    if @flow.update_attributes(params[:flow])
      redirect_to @flow, notice: 'Flow was successfully updated.'
    else
      render action: "edit"
    end
  end

  # DELETE /flows/1
  def destroy
    @flow = @project.flows.find(params[:id])
    @flow.destroy
    redirect_to flows_url
  end
end
