class RegistrationsController < Devise::RegistrationsController
  # POST /resource
  def create
    ActiveRecord::Base.transaction do
      build_resource(params[:user])
      resource.account = Account.create!

      if resource.save
        set_flash_message :notice, :signed_up if is_navigational_format?
        sign_up(resource_name, resource)
        respond_with resource, :location => after_sign_up_path_for(resource)
      else
        clean_up_passwords resource
        respond_with resource
      end
    end
  end
end
