landmark.show = {};

(function(){
//------------------------------------------------------------------------------
//
// Variables
//
//------------------------------------------------------------------------------

var query;


//------------------------------------------------------------------------------
//
// Functions
//
//------------------------------------------------------------------------------

//--------------------------------------
// Data
//--------------------------------------

landmark.show.load = function(q) {
  if(q) query = q;
  var xhr = $.ajax("/query.json", {method:"POST", data:JSON.stringify({q:query.serialize()}), contentType:"application/json"})
  .success(function(data) {
    nodes = landmark.show.normalize(query, data, {limit:6});
    links = landmark.show.links(nodes);
    landmark.show.update();
  })
  // Notify the user if the query fails for some reason.
  .fail(function() {
    alert("Unable to load query data.");
  })
  .always(function() {
    $(".loading").hide();
  });
}

/**
 * Normalizes the results into a data format that we can display in D3.
 */
landmark.show.normalize = function(query, results, options) {
  if(!options) options = {};
  var nodes = [];

  if(query && results) {
    for(var selectionName in results) {
      var selection = query.getSelection(selectionName);
      var dimensioned = (selection.dimensions.length > 0);
      var items = results[selectionName][selection.dimensions[0]];

      for(var key in items) {
        var item = items[key];
        var node = {
          id: selectionName + "-" + key,
          name: key,
          value: item.count,
          depth: parseInt(selectionName.split(".")[0]),
          subdepth: parseInt(selectionName.split(".")[1]),
          selection: selection,
        };
        if(node.name != "") {
          nodes.push(node);
        }
      }
    }
  }
  nodes = nodes.sort(function(a,b) { return b.value-a.value;});

  // Limit nodes.
  if(options.limit > 0) {
    nodes = landmark.show.limit(nodes, options.limit);
  }

  return nodes;
}

landmark.show.links = function(nodes) {
  var lnodes = {};
  for(var i=0; i<nodes.length; i++) {
    if(!lnodes[nodes[i].depth]) lnodes[nodes[i].depth] = {}
    lnodes[nodes[i].depth][nodes[i].subdepth] = nodes[i];
  }

  var links = [];
  for(var i=0; i<nodes.length; i++) {
    var node = nodes[i];
    
    if(node.subdepth == 0 && lnodes[node.depth-1]) {
      var maxPrevSubdepth = 0;
      for(var j in lnodes[node.depth-1]) {
        maxPrevSubdepth = Math.max(maxPrevSubdepth, j);
      }

      var source = lnodes[node.depth-1][maxPrevSubdepth];
      if(source) {
        links.push({source:source, target:node, value:node.value});
      }
    }
  }
  
  return links;
}

landmark.show.query = function(q) {
  if(arguments.length == 0) return query;
  query = q;
}


//------------------------------------------------------------------------------
//
// Events
//
//------------------------------------------------------------------------------

})();
