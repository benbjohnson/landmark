class ProjectsController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_project, :except => [:index, :new, :create]
  
  # GET /projects
  def index
    @projects = current_account.projects.order(:name)
  end

  # GET /projects/:id
  def show
    @top_page_views = top_page_views(@project, 7.days)
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


  private

  def find_project
    @project = current_account.projects.find(params[:id])
    set_current_project(@project)
  end

  def top_page_views(project, duration)
    results = project.query({sessionIdleTime:7200, steps:[
      {:type => 'condition', :expression => "timestamp >= #{(Time.now - duration).to_i}", :steps => [
        {:type => 'condition', :expression => '__action__ == "__page_view__"', :steps => [
          {:type => 'selection', :dimensions => ['__uri__'], :fields => [:name => 'count', :expression => 'count()']}
        ]}
      ]}
    ]})
    return [] if results['__uri__'].nil?

    results = results['__uri__'].each_pair.to_a
    results = results.map{|i| {uri:i.first, count:i.last['count']}}
    results = results.sort{|a,b| a[:count] <=> b[:count] }.reverse[0..9]
    
    results.each do |i|
      i[:resource] = Resource.find_by_uri(i[:uri])
    end
    
    return results
  end
end
