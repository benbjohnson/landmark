class ResourcesController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_resource
  
  # GET /projects/:id/resources/:id
  def next_page_actions
    results = {}
    if !@resource.nil?
      q = {sessionIdleTime:7200, steps:[
        {:type => 'condition', :expression => "__resource__ == '#{encode_lua_string(@resource.name)}' && __action__ == '__page_view__'", :steps => [
          {:type => 'condition', :expression => "__resource__ == '#{encode_lua_string(@resource.name)}' && __action__ != '__page_view__'", :within => [1,1], :steps => [
            {:type => 'selection', :dimensions => ['__href__'], :fields => [:name => 'count', :expression => 'count()']}
          ]}
        ]}
      ]}
      results = @project.query(q)
    end
    
    render :json => results
  end


  private

  def authenticate_user!
    head 401 if !user_signed_in? && params[:apiKey] != "demo"
  end

  def find_resource
    if params[:apiKey] == 'demo'
      @project = Project.find_by_api_key(params[:apiKey])
    else
      @project = current_user.account.projects.find_by_api_key(params[:apiKey])
    end
    return head 404 if @project.nil?
    
    @resource = @project.resources.find_by_name(params[:name])
  end
end
