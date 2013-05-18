class EventsController < ApplicationController
  RESERVED = %w(id apiKey action controller)
  
  # GET /track
  # GET /track.gif
  # POST /track
  def track
    # Require API key & event object.
    api_key, id = params['apiKey'], params['id']
    event = params[:event] ? params[:event] : params.clone
    event.delete_if { |k,v| !RESERVED.index(k).nil? }
    event['action'] = event.delete('_action') if event.has_key?('_action')
    return head 422 if api_key.blank? || id.blank? || event.nil? || event.keys.length == 0

    # Load account by API key.
    account = Account.find_by_api_key(api_key)
    
    # Add action to SQL database if it doesn't exist yet.
    account.actions.find_or_create_by_name(event['action']) unless event['action'].blank?
    
    # Track the event in Sky.
    account.track(id, event)
    
    render :status => :created, :json => {:status => :ok}
  end
end
