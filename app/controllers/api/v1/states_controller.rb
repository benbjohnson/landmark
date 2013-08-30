module Api::V1
  class StatesController < Api::V1::BaseController
    # GET /projects/:id/states/query
    def query
      return render json: {} if @project.states.empty?

      # Generate the Sky query.
      query = []
      query << @project.codegen_state_decl
      query << @project.codegen_states
      query = query.join("\n")
      results = @project.run_query(query: query)

      # Convert states to hashes.
      states = @project.states.as_json(only: [:id, :name, :parent_id])
      transitions = normalize_transitions(results["transitions"])

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

    # Converts prev_state/state nested data to an array of source/target transitions.
    def normalize_transitions(results)
      transitions = []
      results["prev_state"].delete("0")
      results["prev_state"].each_pair do |source, v|
        source = source.to_i
        v["state"].each_pair do |target, v|
          target = target.to_i
          transitions << {"source" => source, "target" => target, "count" => v["count"]}
        end
      end
      return transitions
    end
  end
end
