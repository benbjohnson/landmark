class Graph
  class Error < StandardError; end

  # Lays out a series of nodes and edges.
  def self.layout(nodes, edges)
    # Make sure there are not duplicate or missing node ids.
    ids = nodes.map{|n| n["id"]}
    raise Graph::Error.new("Blank node ids") if ids.detect{|i| i.blank? }
    raise Graph::Error.new("Duplicate node ids") if ids.detect{|i| ids.count(i) > 1 }

    # Generate graph.
    g = GraphViz.new(:G, :type => :digraph)

    lookup = {}
    nodes.each do |node|
      node["n"] = g.add_nodes(node["name"])
      lookup[node["id"]] = node
    end

    edges.each do |edge|
      raise Graph::Error.new("Edge source not found: #{edge['source']}") if lookup[edge["source"]].nil?
      raise Graph::Error.new("Edge target not found: #{edge['target']}") if lookup[edge["target"]].nil?
      edge["source"] = lookup[edge["source"]]
      edge["target"] = lookup[edge["target"]]
      edge["e"] = g.add_edges(edge["source"]["n"], edge["target"]["n"])
    end

    # Output graphviz layout to file and read it back in.
    svg = nil
    tmppath = Tempfile.open(['landmark', '.svg']) {|f| f.path}
    begin
      g.output(svg:tmppath)
      svg = IO.read(tmppath)
    ensure
      FileUtils.rm(tmppath, :force => true)
    end

    # Extract layout from SVG.
    return extract_layout_from_svg(svg)
  end

  private

  # Extracts the node and edge layout from SVG content.
  def self.extract_svg_layout(svg)
    # TODO: Load into Nokogiri.
    # TODO: Extract all nodes.
    # TODO: Extract all edges.
    # TODO: Return data.
  end
end
