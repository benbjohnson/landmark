class FlowsController < ApplicationController
  before_filter :authenticate_user!
  before_filter lambda{ find_project(params[:project_id]); true  }
  respond_to :html, :json
  
  # GET /flows
  def index
    @flows = @project.flows.includes(:steps)

    respond_to do |format|
      format.html
      format.json { render json: @flows }
    end
  end

  # GET /flows/1
  def show
    @flow = @project.flows.includes(:steps).find(params[:id])

    respond_to do |format|
      format.html
      format.json { render json: @flow }
    end
  end

  # GET /flows/new
  # GET /flows/new.json
  def new
    @flow = @project.flows.build

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @flow }
    end
  end

  # GET /flows/1/edit
  def edit
    @flow = @project.flows.find(params[:id])
  end

  # POST /flows
  def create
    @flow = @project.flows.build(params[:flow])

    respond_to do |format|
      if @flow.save
        format.html { redirect_to @flow, notice: 'Flow was successfully created.' }
        format.json { render json: @flow, status: :created, location: @flow }
      else
        format.html { render action: "new" }
        format.json { render json: @flow.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /flows/1
  def update
    @flow = @project.flows.find(params[:id])

    respond_to do |format|
      if @flow.update_attributes(params[:flow])
        format.html { redirect_to @flow, notice: 'Flow was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @flow.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /flows/1
  def destroy
    @flow = @project.flows.find(params[:id])
    @flow.destroy

    respond_to do |format|
      format.html { redirect_to flows_url }
      format.json { head :no_content }
    end
  end
end
