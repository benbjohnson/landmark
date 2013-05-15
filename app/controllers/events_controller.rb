class EventsController < ApplicationController
  # PATCH /track
  def track
    # Require API key & event object.
    api_key, id, event = params['api_key'], params['id'], params['event']
    return head 422 if api_key.blank? || id.blank? || event.nil?

    # Load account by API key.
    account = Account.find_by_api_key(api_key)
    
    # Add action to SQL database if it doesn't exist yet.
    account.actions.find_or_create_by_name(event['action']) unless event['action'].blank?
    
    # Track the event in Sky.
    account.track(id, event)
    
    render :status => :created, :json => {:status => :ok}
  end
end
