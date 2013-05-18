class ActionsController < ApplicationController
  before_filter :authenticate_user!
  respond_to :html, :json

  # GET /actions
  def index
    @actions = current_user.account.actions.fuzzy_search(params[:q])
    respond_with(@actions.page(params[:page]))
  end
end
