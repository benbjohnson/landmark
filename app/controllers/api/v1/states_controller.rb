module Api::V1
  class StatesController < Api::V1::BaseController
    # GET /projects/:id/states/query
    def query
      return render json: {} if @project.states.empty?

      # Generate the Sky query.
      query = []
      query << "DECLARE prev_state AS INTEGER"
      query << "DECLARE state AS INTEGER"
      @project.states.each do |state|
        query << codegen(state)
      end
      query = query.join("\n")
      results = @project.run_query(query: query)

      # Convert states to hashes.
      states = @project.states.as_json(only: [:id, :name, :parent_id])

      # Normalize the transitions to flat arrays.
      transitions = []
      results["transitions"]["prev_state"].delete("0")
      results["transitions"]["prev_state"].each_pair do |source, v|
        source = source.to_i
        v["state"].each_pair do |target, v|
          target = target.to_i
          transitions << {"source" => source, "target" => target, "count" => v["count"]}
        end
      end

      # Generate the layout.
      width, height = generate_layout(states, transitions)

      render :json => {
        width: width,
        height: height,
        states: states,
        transitions: transitions,
      }
    end


    private

    # Recursively generates the query for a given state.
    def codegen(state)
      output = []

      source_condition = "true"
      if !state.sources.empty?
        source_condition = state.sources.map {|source| "state == #{source.id}"}.join(" || ")
      end

      output << "WHEN (#{source_condition}) && (#{state.expression}) THEN"
      output << "  SET prev_state = state"
      output << "  SET state = #{state.id}"
      output << "  SELECT count() AS count GROUP BY prev_state, state INTO 'transitions'"
      output << "END"

      return output.join("\n")
    end

    # Generates the layout using graphviz.
    def generate_layout(states, transitions)
      states.each {|s| s["label"] = s["name"]}

      graph = Miniviz::Graph.new(nodes:states, edges:transitions)
      graph.rankdir = "LR"
      graph.fontname = "Helvetica"
      graph.fontsize = 14
      errors = graph.layout()
      graph.apply_layout()

      states.each {|s| s.delete("label")}

      return graph.width, graph.height
    end
  end
end
