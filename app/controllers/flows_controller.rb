class FlowsController < ApplicationController
  before_filter :authenticate_user!

  # GET /flows
  def index
    @has_actions = current_account.has_actions?
  end

  # GET /flows/view
  def view
    return redirect_to flows_path if params[:id].nil?

    name = params[:id] + (params[:format].blank? ? "" : ".#{params[:format]}")
    @action = current_account.actions.find_by_name(name)
    @properties = current_account.sky_table.get_properties()
    
    # Redirect to home page if the action isn't found.
    return redirect_to flows_path if @action.nil?
  end
end
