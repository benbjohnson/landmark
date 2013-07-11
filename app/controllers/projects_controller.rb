class ProjectsController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_project, :except => [:index, :new, :create]
  
  # GET /projects
  def index
    @projects = current_account.projects.order(:name)
  end

  # GET /projects/:id
  def show
    redirect_to project_flows_path(@project)
  end

  # GET /projects/new
  def new
    @project = Project.new
  end

  # GET /projects/:id/edit
  def edit
    @project = Project.find(params[:id])
  end

  # POST /projects
  def create
    @project = current_account.projects.build(params[:project])

    if @project.save
      redirect_to @project
    else
      render 'new'
    end
  end

  # PATCH /projects/:id
  def update
    @account = Project.find(params[:id])
    params[:project].delete(:api_key)
    @project.update_attributes(params[:project])
    render 'edit'
  end

  # POST /projects/:id/query
  def query
    project = Project.find(params[:id])
    q = params[:q]
    return head 422 if q.nil?

    results = project.query(q)
    render :json => results
  end


  private

  def find_project
    @project = current_account.projects.find(params[:id])
    set_current_project(@project)
  end
end
