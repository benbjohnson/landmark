class FlowsController < ApplicationController
  before_filter :authenticate_user!

  # GET /flows
  def index
  end

  # GET /flows/:id
  def show
    name = params[:id] + (params[:format].blank? ? "" : ".#{params[:format]}")
    @action = current_account.actions.find_by_name(name)
    @properties = current_account.sky_table.get_properties()
    
    # Redirect to home page if the action isn't found.
    if @action.nil?
      return redirect_to flows_path
    end
  end
end
