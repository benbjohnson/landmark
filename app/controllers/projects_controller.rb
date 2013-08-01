class ProjectsController < ApplicationController
  before_filter :authenticate_user!, :except => [:auth]
  before_filter lambda{ find_project(params[:id]); true  }, :except => [:index, :new, :create, :auth]
  
  # GET /projects
  def index
    @projects = current_account.projects.order(:name)
  end

  # GET /projects/:id
  def show
  end

  # GET /projects/new
  def new
    @project = Project.new
  end

  # GET /projects/:id/edit
  def edit
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
    params[:project].delete(:api_key)
    @project.update_attributes(params[:project])
    render 'edit'
  end

  # GET /projects/auth
  def auth
    api_key = params[:apiKey]
    
    if api_key == 'demo' || (current_account && current_account.projects.where(:api_key => api_key).count > 0)
      render :json => {:status => 'ok'}
    else
      head 404
    end
  end
end
