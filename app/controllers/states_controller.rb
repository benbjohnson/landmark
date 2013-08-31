class StatesController < ApplicationController
  before_filter :authenticate_user!
  before_filter lambda{ find_project(params[:project_id]); true  }
  before_filter :normalize_params
  respond_to :html

  # GET /projects/:id/states
  def index
    @states = @project.states
  end

  # GET /projects/:id/states/new
  def new
    @state = @project.states.build
  end

  # POST /projects/:id/states
  def create
    @state = @project.states.build(params[:state])
    if @state.save
      redirect_to(project_states_path(@project), :notice => 'State was successfully created.')
    else
      render :action => "new"
    end
  end

  # GET /projects/:id/states/new
  def edit
    @state = @project.states.find(params[:id])
  end

  # POST /projects/:id/states
  def update
    @state = @project.states.find(params[:id])
    if @state.update_attributes(params[:state])
      redirect_to(project_states_path(@project), :notice => 'State was successfully created.')
    else
      render :action => "edit"
    end
  end

  private

  def normalize_params
    return if params[:state].nil?
    
    sources = params[:state]["sources"]
    if sources
      sources.reject! {|id| id.blank?}
      sources.map! {|id| @project.states.find(id)}
      params[:state]["sources"] = sources
    end
  end
end
