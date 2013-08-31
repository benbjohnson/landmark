module Api::V1
  class StatesController < Api::V1::BaseController
    # GET /projects/:id/states/query
    def query
      return render json: {} if @project.states.empty?

      replay_from = params[:replay_from].to_i
      step = (params[:step] || 1).to_i
      step_unit = (params[:step_unit] || "DAY").to_s.upcase
      duration = (params[:duration] || 30).to_i
      duration_unit = (params[:duration_unit] || "DAY").to_s.upcase

      # Generate the Sky query.
      query = []
      query << @project.codegen_state_decl
      query << @project.codegen_states(
        after: lambda {|state|
          out = []
          if state.id == replay_from
            out << "FOR index EVERY #{step} #{step_unit} WITHIN #{duration} #{duration_unit}"
            out << "  FOR EACH EVENT"
            out << @project.codegen_states(
              after: "SELECT count() AS count GROUP BY index, prev_state, state INTO 'transitions'"
            ).gsub(/^/, "    ")
            out << "  END"
            out << "  SELECT count() AS count GROUP BY index, state INTO 'states'"
            out << "END"
          else
            out << "SELECT count() AS count GROUP BY prev_state, state INTO 'transitions'"
          end
          return out.join("\n")
        }
       )
      query = query.join("\n")
      results = @project.run_query(query: query)

      # Normalize states.
      states = @project.states.as_json(only: [:id, :name, :parent_id])
      attach_state_counts(states, results["states"]) if replay_from > 0

      # Normalize transitions into something usable.
      if replay_from > 0
        transitions = normalize_replay_transitions(results["transitions"])
      else
        transitions = normalize_transitions(results["transitions"])
      end
      transitions = collapse_transitions(transitions)

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

    def attach_state_counts(states, results)
      states.each {|state| state["indices"] = {}}
      lookup = states.inject({}) {|h, state| h[state["id"]] = state; h }
      results["index"].each_pair do |index, v1|
        v1["state"].each_pair do |state_id, v2|
          state = lookup[state_id.to_i]
          state["indices"][index.to_i-1] = v2 unless state.nil?
        end
      end
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

    # Converts prev_state/state nested data when using replay.
    def normalize_replay_transitions(results)
      transitions = []
      if results["index"]
        results["index"].each_pair do |index, v|
          tmp = normalize_transitions(v)
          tmp.each {|t| t["index"] = index.to_i}
          transitions.concat(tmp)
        end
      end
      return transitions
    end

    # Collapses transitions to group by source/target.
    def collapse_transitions(arr)
      lookup = {}
      arr.each do |transition|
        lookup[transition["source"]] ||= {}
        lookup[transition["source"]][transition["target"]] ||= {
          "source" => transition["source"],
          "target" => transition["target"], 
          "label" => transition["count"].to_i,
          "weight" => transition["count"].to_i,
          "indices" => {},
        }
        index = (transition["index"] || 1) - 1
        lookup[transition["source"]][transition["target"]]["indices"][index] = {"count" => transition["count"]}
      end

      transitions = []
      lookup.keys.each do |source|
        lookup[source].keys.each do |target|
          transitions << lookup[source][target]
        end
      end
      return transitions
    end
  end
end
