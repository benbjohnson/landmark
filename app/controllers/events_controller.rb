class EventsController < ApplicationController
  # GET /track
  # GET /track.gif
  # POST /track
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

    # This is an invalid request if we do not have an API key, some kind of id or any properties.
    return head 422 if api_key.blank? || (id.blank? && tracking_id.blank?) || (properties.empty? && traits.empty?)

    # Load project by API key.
    project = Project.find_by_api_key(api_key)
    return head 404 if project.nil?

    # Mark the action as anonymous if we do not have a source system id.
    properties['anonymous'] = id.blank?

    # Use the tracking id if we don not have a source system id.
    if id.blank?
      id = "~#{tracking_id}"
    end
    
    # Track the event in Sky.
    project.track(id, traits, properties)
    
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
