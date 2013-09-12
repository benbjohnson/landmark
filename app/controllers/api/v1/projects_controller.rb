module Api::V1
  class ProjectsController < Api::V1::BaseController
    skip_before_filter :authenticate_api_user!, :only => [:auth, :track]
    skip_before_filter :find_project, :only => [:track]

    # GET /api/v1/projects/auth
    def auth
      render :json => {:status => 'ok'}
    end

    # GET /api/v1/projects/track
    def track
      # Localize all url parameters.
      api_key, id = params['apiKey'], params['id']
      id, tracking_id = params['id'], params['t']
      traits = parse_json_hash(params['traits'])
      properties = parse_json_hash(params['properties'])

      # Log everything that came in case we need to replay it.
      log({
        api_key:api_key,
        id:id,
        t:tracking_id,
        timestamp:DateTime.now.iso8601,
        traits:traits,
        properties:properties,
      })

      internal_tracking_id = (tracking_id.blank? ? nil : "~#{tracking_id}")

      # This is an invalid request if we do not have an API key, some kind of id or any properties.
      return head 422 if api_key.blank? || (id.blank? && tracking_id.blank?) || (properties.empty? && traits.empty?)

      @project = Project.find_by_api_key(api_key)
      return head 404 if @project.nil?

      # Ignore requests if the project is locked.
      return head 202 if @project.locked?
      
      # Mark the action as anonymous if we do not have a source system id.
      anonymous = id.blank?
      properties['anonymous'] = anonymous

      # Use the tracking id if we do not have a source system id.
      if anonymous
        id = internal_tracking_id
      
      # If we have a source system id then make sure it merges any previous anonymous tracking.
      elsif !tracking_id.blank?
        @project.sky_table.merge_objects(id, internal_tracking_id)
      end
      
      # Track the event in Sky.
      @project.track(id, traits, properties)
      
      render :status => :created, :json => {:status => :ok}
    end


    private
    
    def parse_json_hash(str)
      if !str.blank?
        v = JSON.parse(str)
        return v if v.is_a?(Hash)
      end
      
      return {}
    end

    def log(obj)
      Logger.new('log/events.log').info obj.to_json
    end
  end
end
