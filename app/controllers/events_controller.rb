class EventsController < ApplicationController
  # GET /track
  # GET /track.gif
  # POST /track
  def track
    api_key, id = params['apiKey'], params['id']
    traits = parse_json_hash(params['traits'])
    properties = parse_json_hash(params['properties'])
    log({api_key:api_key, id:id, timestamp:DateTime.now.iso8601, traits:traits, properties:properties})
    return head 422 if api_key.blank? || id.blank? || (properties.empty? && traits.empty?)

    # Load project by API key.
    project = Project.find_by_api_key(api_key)
    return head 404 if project.nil?
    
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
