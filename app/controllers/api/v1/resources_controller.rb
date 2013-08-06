module Api::V1
  class ResourcesController < Api::V1::BaseController
    # GET /projects/:id/resources/:id
    def next_page_actions
      @resource = @project.resources.find_by_name(params[:name])

      results = {}
      if !@resource.nil?
        q = {sessionIdleTime:7200, steps:[
          {:type => 'condition', :expression => "__resource__ == '#{encode_lua_string(@resource.name)}' && __action__ == '__page_view__'", :steps => [
            {:type => 'selection', :dimensions => [], :fields => [:name => 'count', :expression => 'count()']},
            {:type => 'condition', :expression => "__resource__ == '#{encode_lua_string(@resource.name)}' && __action__ != '__page_view__'", :within => [1,1], :steps => [
              {:type => 'selection', :dimensions => ['__href__'], :fields => [:name => 'count', :expression => 'count()']}
            ]}
          ]}
        ]}
        results = @project.query(q)
      end
      
      render :json => results
    end
  end
end
