require 'tempfile'

module Api::V1
  class GraphsController < Api::V1::BaseController
    skip_before_filter :authenticate_api_user!
    skip_before_filter :find_project

    # GET /graph/layout
    def layout
      nodes, edges = params["nodes"], params["edges"]

      begin
        render :json => Miniviz::Graph.layout(nodes:nodes, edges:edges)
      rescue Graph::Error => e
        render status: 404, json: {error: e.message}
      end
    end
  end
end
