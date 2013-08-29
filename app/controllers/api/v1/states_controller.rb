module Api::V1
  class StatesController < Api::V1::BaseController
    # GET /projects/:id/states/query
    def query
      @root = @project.states.where("parent_id IS NULL").first
      return render json: {} if @root.nil?

      query = []
      query << "DECLARE prev_state AS INTEGER"
      query << "DECLARE state AS INTEGER"
      query << codegen(@root)
      query = query.join("\n")

      results = @project.run_query(query: query)

      transitions = []
      results["transitions"]["prev_state"].each_pair do |source, v|
        source = source.to_i
        v["state"].each_pair do |target, v|
          target = target.to_i
          transitions << {"source" => source, "target" => target, "count" => v["count"]}
        end
      end
      results["transitions"] = transitions

      json  = "{"
      json += "\"states\":#{@project.states.to_json(only: [:id, :name, :parent_id])},"
      json += "\"transitions\":#{results["transitions"].to_json}"
      json += "}"
      render :json => json
    end


    private

    # Recursively generates the query for a given state.
    def codegen(state)
      output = []

      output << "WHEN state == #{state.parent_id.to_i} && #{state.expression} THEN"
      output << "  SET prev_state = state"
      output << "  SET state = #{state.id}"
      output << "  SELECT count() AS count GROUP BY prev_state, state INTO 'transitions'"
      output << "END"

      state.children.each do |child|
        output << codegen(child)
      end

      return output.join("\n")
    end
  end
end
