class EventsController < ApplicationController
  before_filter :authenticate_user!, :except => [:track]
  
  # GET /track
  # GET /track.gif
  # POST /track
  def track
    api_key, id = params['apiKey'], params['id']
    traits = JSON.parse(params['traits']) rescue nil
    properties = JSON.parse(params['properties']) rescue nil
    data = {}.merge(properties || {}).merge(traits || {})
    return head 422 if api_key.blank? || id.blank? || !data.is_a?(Hash) || data.keys.length == 0

    # Load account by API key.
    account = Account.find_by_api_key(api_key)
    
    # Track the event in Sky.
    account.track(id, data)
    
    render :status => :created, :json => {:status => :ok}
  end

  # POST /query
  def query
    q = params[:q]
    return head 422 if q.nil?

    results = current_account.query(q)
    render :json => results
  end
end
