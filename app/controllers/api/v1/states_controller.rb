module Api::V1
  class StatesController < Api::V1::BaseController
    # GET /projects/:id/states/query
    def query
      return render json: {} if @project.states.empty?

      replay_from = params[:replay_from].to_i
      step = (params[:step] || 1).to_i
      duration = (params[:duration] || 30).to_i
      unit = (params[:unit] || "DAY").to_s.upcase

      # Generate the Sky query.
      query = []
      query << @project.codegen_state_decl
      query << "DECLARE index AS INTEGER"
      query << @project.codegen_states(
        after: lambda {|state|
          out = []
          if state.id == replay_from
            out << "FOR index EVERY #{step} #{unit} WITHIN #{duration} #{unit}"
            out << "  FOR EACH EVENT"
            out << @project.codegen_states(
              after: "SELECT count() AS count GROUP BY index, prev_state, state INTO 'transitions'"
            ).gsub(/^/, "    ")
            out << "  END"
            out << "  SELECT count() AS count GROUP BY index, state INTO 'states'"
            out << "END"
          else
            out << "SELECT count() AS count GROUP BY index, prev_state, state INTO 'transitions'"
          end
          return out.join("\n")
        }
       )
      query = query.join("\n")
      # warn(query)
      results = @project.run_query(query: query)

      # Normalize states.
      states = @project.states.as_json(only: [:id, :name])
      lookup = states.inject({}) {|h,state| h[state["id"]] = state; h}
      if replay_from > 0
        results["states"] = SkyDB.denormalize(results["states"], ["index", "state"])
        SkyDB.normalize(results["states"], ["index"], ["count"]).each do |item|
          state = lookup[item["state"].to_i]
          state["index"] = item["index"] unless state.nil?
        end
      end

      # Normalize transitions into something usable.
      transitions = results["transitions"]
      transitions = SkyDB.denormalize(transitions, ["index", "prev_state", "state"])
      transitions = SkyDB.normalize(transitions, ["index"], ["count"])
      transitions.each do |transition|
        transition["source"] = transition.delete("prev_state")
        transition["target"] = transition.delete("state")
        transition["label"] = transition["weight"] = transition["index"].values.first["count"]
      end
      transitions.reject! {|transition| transition["source"] == "0" || transition["target"] == "0"}

      # Generate the layout.
      width, height = generate_layout(states, transitions)
      json = {
        width: width,
        height: height,
        states: states,
        transitions: transitions,
      }
      if replay_from > 0
        json[:replay] = {
            id: replay_from,
            step: step,
            duration: duration,
            unit: unit,
          }
      end
      render :json => json
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
  end
end
