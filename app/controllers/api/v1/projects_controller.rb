module Api::V1
  class ProjectsController < Api::V1::BaseController
    # GET /api/v1/projects/auth
    def auth
      return 404 if @project.nil?
      render :json => {:status => 'ok'}
    end
  end
end
