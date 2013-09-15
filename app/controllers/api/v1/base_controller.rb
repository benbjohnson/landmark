module Api
  module V1
    class BaseController < Api::BaseController
      skip_before_filter :verify_authenticity_token
      before_filter :authenticate_api_user!
      before_filter :find_project

      protected

      def authenticate_api_user!
        head 401 if !user_signed_in?
      end

      def find_project
        if user_signed_in?
          if params[:project_id]
            @project = current_user.account.projects.find(params[:project_id])
          else
            @project = current_user.account.projects.find_by_api_key(params[:apiKey])
          end
        end
        return head 404 if @project.nil?
      end
    end
  end
end
