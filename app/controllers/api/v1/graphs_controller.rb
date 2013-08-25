require 'tempfile'

module Api::V1
  class GraphsController < Api::V1::BaseController
    skip_before_filter :authenticate_api_user!
    skip_before_filter :find_project

    # GET /graph/layout
    def layout
      nodes, edges = params["nodes"], params["edges"]

      begin
        svg = Graph.layout(nodes, edges)
        render :text => svg
      rescue Graph::Error => e
        render status: 404, json: {error: e.message}
      end
    end
  end
end
