class EventsController < ApplicationController
  # GET /track
  # GET /track.gif
  # POST /track
  def track
    api_key, id = params['apiKey'], params['id']
    traits = JSON.parse(params['traits']) rescue nil
    properties = JSON.parse(params['properties']) rescue nil
    data = {}.merge(traits || {}).merge(properties || {})
    log({api_key:api_key, id:id, timestamp:DateTime.now.iso8601, traits:traits, properties:properties})
    return head 422 if api_key.blank? || id.blank? || !data.is_a?(Hash) || data.keys.length == 0

    # Load project by API key.
    project = Project.find_by_api_key(api_key)
    
    # Track the event in Sky.
    project.track(id, data)
    
    render :status => :created, :json => {:status => :ok}
  end

  private
  
  def log(obj)
    Logger.new('log/events.log').info obj.to_json
  end
end
