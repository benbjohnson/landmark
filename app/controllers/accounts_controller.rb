class AccountsController < ApplicationController
  # GET /signup
  def new
    @account = Account.new
    @account.users.build
  end

  # POST /signup
  def create
    @account = Account.new(params[:account])
    @account.users.first.account = @account
    
    if @account.save
      flash[:success] = "Account created"
      redirect_to new_user_session_path
    else
      render 'new'
    end
  end
end
