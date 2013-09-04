module Api::V1
  class ActionsController < Api::V1::BaseController
    respond_to :json

    # GET /projects/:id/actions/query
    def query
      funnel = params[:funnel].to_a
      has_funnel = !funnel.empty?

      # The selection and previous variable clause.
      selection = []
      selection << "  SELECT count() AS count GROUP BY __channel__, __resource__, __action__ INTO 'nodes'"
      selection << "  SELECT count() AS count GROUP BY __prev_channel__, __prev_resource__, __prev_action__, __channel__, __resource__, __action__ INTO 'transitions'"
      selection << "  SET __prev_channel__ = __channel__"
      selection << "  SET __prev_resource__ = __resource__"
      selection << "  SET __prev_action__ = __action__"
      selection.join("\n")

      # Generate the Sky query.
      query = []
      query << "DECLARE __prev_channel__ AS FACTOR(__channel__)"
      query << "DECLARE __prev_resource__ AS FACTOR(__resource__)"
      query << "DECLARE __prev_action__ AS FACTOR(__action__)"
      query << "WHEN __action__ != '' THEN"
      if has_funnel
        funnel.each_with_index do |step, index|
          query << "WHEN __channel__ == #{step["__channel__"].to_s.to_lua} && __resource__ == #{step["__resource__"].to_s.to_lua} && __action__ == #{step["__action__"].to_s.to_lua} #{index > 0 ? "WITHIN 1 .. 1000000 STEPS" : ""} THEN"
          query << selection
        end
        query << "FOR EACH EVENT"
      end
      query << selection
      if has_funnel
        funnel.each do |step|
          query << "END"
        end
        query << "END"
      end
      query << "END"
      query = query.join("\n")
      # warn(query)
      results = @project.run_query(query: query)

      # Normalize nodes.
      channels = []
      nodes = SkyDB.denormalize(results["nodes"], ["__channel__", "__resource__", "__action__"])
      nodes.group_by {|node| node["__channel__"]}.each_pair do |k,v|
        channels << {"name" => k, "nodes" => v}
      end
      channels.map {|channel| channel["id"] = channel["nodes"].first["__channel__"]}
      channels.each do |channel|
        channel["name"] = channel["id"].titleize.strip
      end
      lookup = nodes.inject({}) do |h,n|
        t = h
        t = t[n["__channel__"]] ||= {}
        t = t[n["__resource__"]] ||= {}
        t = t[n["__action__"]] = n
        h
      end
      
      # Normalize transitions.
      transitions = SkyDB.denormalize(results["transitions"], ["__prev_channel__", "__prev_resource__", "__prev_action__", "__channel__", "__resource__", "__action__"])

      # Trim to top nodes/transitions.
      transitions.reject! {|t| t["__prev_channel__"] == t["__channel__"] && t["__prev_resource__"] == t["__resource__"] && t["__prev_action__"] == t["__action__"]}
      transitions = transitions.sort {|a,b| a["count"] <=> b["count"]}.reverse
      transitions = transitions[0,40]
      transitions.reject! do |t|
        source = (lookup[t["__prev_channel__"]][t["__prev_resource__"]][t["__prev_action__"]] rescue nil)
        target = (lookup[t["__channel__"]][t["__resource__"]][t["__action__"]] rescue nil)
        rejected = (source.nil? || target.nil?)
        source["marked"] = target["marked"] = true unless rejected
        rejected
      end
      channels.each do |channel|
        channel["nodes"].select! {|n| n["marked"]}
      end
      nodes.select! {|n| n["marked"]}
      nodes.each {|n| n.delete("marked")}

      # Generate the layout.
      width, height = generate_layout(channels, transitions)
      channels.each {|channel| channel.delete("nodes")}
      json = {
        width: width,
        height: height,
        channels: channels,
        nodes: nodes,
        transitions: transitions,
      }
      render :json => json
    end


    private

    # Generates the layout using graphviz.
    def generate_layout(nodes, transitions)
      # Transform for the layout engine.
      nodes.each do |node|
        node["id"] = node["name"]
        node["label"] = node["name"]
        node["nodes"].each do |n|
          n["id"] = [n["__channel__"], n["__resource__"], n["__action__"]].join("---")
          n["label"] = n["__resource__"]
        end
      end
      counts = transitions.map{|t| t["count"]}
      min_count, max_count = counts.min.to_f, counts.max.to_f
      max_penwidth = 5.0
      transitions.each do |transition|
        transition["source"] = [transition["__prev_channel__"], transition["__prev_resource__"], transition["__prev_action__"]].join("---")
        transition["target"] = [transition["__channel__"], transition["__resource__"], transition["__action__"]].join("---")
        transition["weight"] = transition["label"] = transition["count"]
        if max_count == min_count
          transition["penwidth"] = 1
        else
          transition["penwidth"] = (((transition["count"].to_f - min_count) / (max_count - min_count)) * (max_penwidth-1)) + 1
        end
      end

      graph = Miniviz::Graph.new(nodes:nodes, edges:transitions)
      graph.rankdir = "TB"
      graph.fontname = "Helvetica"
      graph.fontsize = 14
      errors = graph.layout()
      graph.apply_layout()

      # Remove transforms.
      nodes.each do |node|
        node.delete("label")
        node["nodes"].each {|n| n.delete("id"); n.delete("label")}
      end
      transitions.each do |transition|
        transition.delete("source")
        transition.delete("target")
        transition.delete("weight")
        transition.delete("label")
      end

      return graph.width, graph.height
    end
  end
end
