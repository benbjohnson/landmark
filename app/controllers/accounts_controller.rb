class AccountsController < ApplicationController
  # GET /account
  def show
    redirect_to edit_account_path
  end

  # GET /account/edit
  def edit
    @account = current_account
  end

  # PATCH /account
  def update
    @account = current_account
    params[:account].delete(:api_key)
    @account.update_attributes(params[:account])
    render 'edit'
  end
end
