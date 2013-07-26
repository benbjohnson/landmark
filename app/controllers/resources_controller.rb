class ResourcesController < ApplicationController
  before_filter :authenticate_user!
  before_filter { find_project(params[:project_id]) }
  
  # GET /projects/:id/resources/:id
  def show
    @resource = Resource.find_by_slug(params[:id])
    @next_pages = next_pages(@resource.uri, 7.days)
  end


  private

  def next_pages(uri, duration)
    results = project.query({sessionIdleTime:7200, steps:[
      {:type => 'condition', :expression => "timestamp >= #{(Time.now - duration).to_i}", :steps => [
        {:type => 'condition', :expression => "__uri__ = '#{encode_lua_string(uri)}' && __action__ == '__page_view__'", :steps => [
          {:type => 'condition', :expression => "__action__ == '__page_view__'", :within => [1,99999], :steps => [
            {:type => 'selection', :dimensions => ['__uri__'], :fields => [:name => 'count', :expression => 'count()']}
          ]}
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
    
    return :json => results
  end
end
