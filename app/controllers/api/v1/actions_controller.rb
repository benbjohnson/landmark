module Api::V1
  class ActionsController < Api::V1::BaseController
    respond_to :json

    # GET /projects/:id/actions/query
    def query
      start_date, end_date = params[:start_date], params[:end_date]
      start_date = start_date.blank? ? nil : DateTime.iso8601(start_date).to_i
      end_date = end_date.blank? ? nil : DateTime.iso8601(end_date).to_i + 86400

      funnel = params[:funnel].to_a
      has_funnel = !funnel.empty?

      segment_by = params[:segment_by]
      segment_by = nil if segment_by.blank?

      # Timestamp filter.
      condition = []
      condition << "timestamp >= #{start_date}" unless start_date.nil?
      condition << "timestamp < #{end_date}" unless end_date.nil?

      # The selection and previous variable clause.
      selection = []
      selection << "  WHEN  #{condition.join(" && ")} THEN" unless condition.empty?
      selection << "  FOR EACH SESSION DELIMITED BY 2 HOURS"
      selection << "    FOR EACH EVENT"
      selection << "      SELECT count() AS count GROUP BY channel, resource, action INTO 'nodes'"
      selection << "      SELECT count() AS count GROUP BY prev_channel, prev_resource, prev_action, channel, resource, action INTO 'transitions'"
      selection << "      SET prev_channel = channel"
      selection << "      SET prev_resource = resource"
      selection << "      SET prev_action = action"
      selection << "    END"
      selection << "  END"
      selection << "  END" unless condition.empty?
      selection.join("\n")

      # Generate the Sky query.
      query = []
      query << "DECLARE prev_channel AS FACTOR(channel)"
      query << "DECLARE prev_resource AS FACTOR(resource)"
      query << "DECLARE prev_action AS FACTOR(action)"
      if has_funnel
        funnel.each_with_index do |step, index|
          query << "WHEN channel == #{step["channel"].to_s.to_lua} && resource == #{step["resource"].to_s.to_lua} && action == #{step["action"].to_s.to_lua} #{index > 0 ? "WITHIN 1 .. 1000000 STEPS" : ""} THEN"
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
      query = query.join("\n")
      # warn(query)
      results = @project.run_query(query: query)

      # Normalize nodes.
      channels = []
      nodes = SkyDB.denormalize(results["nodes"], ["channel", "resource", "action"])
      nodes.group_by {|node| node["channel"]}.each_pair do |k,v|
        channels << {"name" => k, "nodes" => v}
      end
      channels.map {|channel| channel["id"] = channel["nodes"].first["channel"]}
      channels.each do |channel|
        channel["name"] = channel["id"].titleize.strip
      end
      lookup = nodes.inject({}) do |h,n|
        t = h
        t = t[n["channel"]] ||= {}
        t = t[n["resource"]] ||= {}
        t = t[n["action"]] = n
        h
      end
      
      # Normalize transitions.
      transitions = SkyDB.denormalize(results["transitions"], ["prev_channel", "prev_resource", "prev_action", "channel", "resource", "action"])

      # Trim to top nodes/transitions.
      transitions.reject! {|t| t["prev_channel"] == t["channel"] && t["prev_resource"] == t["resource"] && t["prev_action"] == t["action"]}
      transitions = transitions.sort {|a,b| a["count"] <=> b["count"]}.reverse
      transitions = transitions[0,40]
      transitions.reject! do |t|
        source = (lookup[t["prev_channel"]][t["prev_resource"]][t["prev_action"]] rescue nil)
        target = (lookup[t["channel"]][t["resource"]][t["action"]] rescue nil)
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
          n["id"] = [n["channel"], n["resource"], n["action"]].join("---")
          n["label"] = n["resource"]
        end
      end
      counts = transitions.map{|t| t["count"]}
      min_count, max_count = counts.min.to_f, counts.max.to_f
      max_penwidth = 5.0
      transitions.each do |transition|
        transition["source"] = [transition["prev_channel"], transition["prev_resource"], transition["prev_action"]].join("---")
        transition["target"] = [transition["channel"], transition["resource"], transition["action"]].join("---")
        transition["weight"] = transition["label"] = transition["count"]
        if max_count == min_count
          transition["penwidth"] = max_penwidth
        else
          transition["penwidth"] = (((transition["count"].to_f - min_count) / (max_count - min_count)) * max_penwidth)
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
