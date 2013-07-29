class ResourcesController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_resource
  
  # GET /projects/:id/resources/:id
  def next_page_views
    results = []
    if !@resource.nil?
      results = @project.query({sessionIdleTime:7200, steps:[
        {:type => 'condition', :expression => "__resource__ == '#{encode_lua_string(@resource.name)}' && __action__ == '__page_view__'", :steps => [
          {:type => 'condition', :expression => "__action__ == '__page_view__'", :within => [1,99999], :steps => [
            {:type => 'selection', :dimensions => ['__resource__'], :fields => [:name => 'count', :expression => 'count()']}
          ]}
        ]}
      ]})
      return [] if results['__resource__'].nil?

      results = results['__resource__'].each_pair.to_a
      results = results.map{|i| {name:i.first, count:i.last['count']}}
      results = results.sort{|a,b| a[:count] <=> b[:count] }.reverse[0..9]
    end
    
    render :json => results
  end


  private

  def authenticate_user!
    head 401 if !user_signed_in? && params[:apiKey] != "demo"
  end

  def find_resource
    if params[:apiKey] == 'demo'
      Project.find_by_api_key('demo')
    else
      @project = current_user.account.projects.find_by_api_key(params[:apiKey])
    end
    return head 404 if @project.nil?
    
    @resource = @project.resources.find_by_name(params[:name])
  end
end
