landmark.view = {};

(function(){
//------------------------------------------------------------------------------
//
// Variables
//
//------------------------------------------------------------------------------

var query;
var flow = d3.flow();
var nodes = [], links = [];
var easingType = "quad-in";

var popoverNode = null;


//------------------------------------------------------------------------------
//
// Functions
//
//------------------------------------------------------------------------------

//--------------------------------------
// Data
//--------------------------------------

landmark.view.load = function(q) {
  if(q) query = q;
  var xhr = $.ajax("/projects/" + landmark.projectId + "/query.json", {method:"POST", data:JSON.stringify({q:query.serialize()}), contentType:"application/json"})
  .success(function(data) {
    nodes = landmark.view.normalize(query, data, {limit:6});
    links = landmark.view.links(nodes);
    landmark.view.update();
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
landmark.view.normalize = function(query, results, options) {
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
          title: key,
          value: item.count,
          expressionValue: key,
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
    nodes = landmark.view.limit(nodes, options.limit);
  }

  return nodes;
}

/**
 * Generates a list of links between nodes.
 */
landmark.view.links = function(nodes) {
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

/**
 * Limits the number of nodes in each level.
 */
landmark.view.limit = function(nodes, count) {
  // Split up by depth.
  var dnodes = {};
  for(var i=0; i<nodes.length; i++) {
    var node = nodes[i];
    if(!dnodes[node.depth]) dnodes[node.depth] = {};
    if(!dnodes[node.depth][node.subdepth]) dnodes[node.depth][node.subdepth] = [];
    dnodes[node.depth][node.subdepth].push(node);
  }
  
  // Limit each level.
  for(var depth in dnodes) {
    for(var subdepth in dnodes[depth]) {
      if(dnodes[depth][subdepth].length > count) {
        var others = dnodes[depth][subdepth].splice(count-1, dnodes[depth][subdepth].length-count+1);
        var other = {
          id: depth.toString() + ":" + subdepth.toString() + ".__other__",
          type:"other",
          title: "Other",
          depth: parseInt(depth),
          subdepth: parseInt(subdepth),
          value: d3.sum(others, function(d) { return d.value; })
        };
        dnodes[depth][subdepth].push(other);
      }
    }
  }

  // Recombine.
  nodes = [];
  for(var depth in dnodes) {
    for(var subdepth in dnodes[depth]) {
      nodes = nodes.concat(dnodes[depth][subdepth])
    }
  }
  
  return nodes;
}

landmark.view.query = function(q) {
  if(arguments.length == 0) return query;
  query = q;
}

landmark.view.projectId = function(value) {
  if(arguments.length == 0) return projectId;
  projectId = value;
}


//--------------------------------------
// Layout
//--------------------------------------

/**
 * Refreshes the view.
 */
landmark.view.update = function(options) {
  // Update the dimensions of the visualization.
  var chart = $("#chart")[0];
  flow.maxNodeWidth(200);
  flow.width($(chart).width());
  flow.height(window.innerHeight - $(chart).offset().top - 40);

  // Layout data.
  flow.layout(nodes, links, options);

  // Update SVG container.
  var margin = flow.margin();
  d3.select(chart).select("svg")
    .attr("width", flow.width()).attr("height", flow.height());

  // Layout links.
  d3.select(chart).select("g#links")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .selectAll(".link").data(links, function(d) { return d.key; })
    .call(function(link) {
      var enter = link.enter(), exit = link.exit();
      link.transition().ease(easingType)
        .call(flow.links.position)
        .attr("stroke-dashoffset", 0);

      enter.append("path").attr("class", "link")
        .call(flow.links.position)
        .each(function(path) {
          var totalLength = this.getTotalLength();
          d3.select(this)
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition().ease(easingType)
              .delay(function(d) { return 250 + (d.target.index*100)})
              .duration(250)
              .attr("stroke-dashoffset", 0)
              .each("end", function(d) { d3.select(this).attr("stroke-dasharray", "none") });
        });

      exit.remove();
    });

  // Layout nodes.
  d3.select(chart).select("g#nodes")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .selectAll(".node").data(nodes, function(d) { return d.key })
    .call(function(node) {
      var enter = node.enter(), exit = node.exit();
      
      // Update selection.
      node.selectAll("rect").data(nodes, function(d) { return d.key })
        .transition().ease(easingType)
          .call(flow.nodes.position)
          .style("fill", "#1ABC9C")
          .style("fill-opacity", 1)
          .style("stroke-opacity", 1);
      node.selectAll(".title").data(nodes, function(d) { return d.key })
        .transition().ease(easingType)
        .call(flow.nodes.title.position)
        .style("fill", "#ffffff")
        .style("fill-opacity", 1);
        
      // Enter selection.
      var g = enter.append("g").attr("class", "node")
        .on("click", node_onClick)
        .on("mouseover", node_onMouseOver);
      var rect = g.append("rect");
      rect.style("fill", "#1ABC9C")
        .style("fill-opacity", function(d) { return (d.depth == 0 && d.subdepth == 0 ? 1 : 0); })
        .call(flow.nodes.position)
        .transition().ease(easingType).delay(nodeDelay)
          .style("fill-opacity", 1)
          .style("stroke-opacity", 1)
      var title = g.append("text")
        .attr("class", "title")
        .attr("dy", "1em")
        .style("fill", "#ffffff")
        .style("fill-opacity", function(d) { return (d.depth == 0 && d.subdepth == 0 ? 1 : 0); })
        .call(flow.nodes.title.position)
        .text(function(d) { return d.title; })
        .transition().ease(easingType).delay(nodeDelay)
          .style("fill-opacity", 1)

      // Exit selection.
      exit.remove();
    });
}

function nodeDelay(node) {
  return 500 + (node.index*100);
}

//--------------------------------------
// Popover
//--------------------------------------

function removePopover() {
  popoverNode = null;
  $("*").popover("hide");
  $(".popover").remove()
  $(".tooltip").remove()
}


//------------------------------------------------------------------------------
//
// Events
//
//------------------------------------------------------------------------------

//--------------------------------------
// Node
//--------------------------------------

/**
 * Asks user what they want to do next.
 */
function node_onClick(node) {
  if(node.type == "other") return;

  // If we've already drilled in then left the far left node go back up.
  if(node.depth > 0 && node.depth == flow.minDepth()) {
    appendToQuery(node, "action", [1, 1]);
  }
  // Otherwise show a menu of options.
  else {
    // Histograms can be computed for numeric properties.
    var numericProperties = landmark.properties().filter(function(property) { return property.dataType == "integer" || property.dataType == "float"}).sort(landmark.properties.sortFunction);
    var showHistogramMenuHtml = numericProperties.length == 0 ? '' :
        '    <li class="dropdown-submenu">' +
        '      <a href="#">Show Histogram</a>' +
        '      <ul class="dropdown-menu">' +
        numericProperties.map(function(property) { return '<li class="show-histogram" data-property-name="' + property.name + '"><a href="#">' + property.name + '</a></li>'}).join("") +
        '      </ul>' +
        '    </li>';

    // String-like properties can be filtered on.
    var stringProperties = landmark.properties().filter(function(property) { return (property.dataType == "string" || property.dataType == "factor") && property.name != "action"});
    var filterByMenuHtml = stringProperties.length == 0 ? '' :
        '    <li class="dropdown-submenu">' +
        '      <a href="#">Filter By</a>' +
        '      <ul class="dropdown-menu">' +
        stringProperties.map(function(property) { return '<li class="filter-by" data-property-name="' + property.name + '"><a href="#">' + property.name + '</a></li>'}).join("") +
        '      </ul>' +
        '    </li>';

    $("*").popover("destroy").tooltip("destroy");
    $(this).popover({
      html: true, container:"body", trigger:"manual",
      placement: (node.depth == flow.minDepth() ? "right" : "left"),
      template: '<div class="popover node-popover"><div class="popover-content"></div></div>',
      content:
        '<div class="dropdown open">' +
        '  <ul class="dropdown-menu dropdown-inverse" id="menu1">' +
        '    <li class="show-next-actions">' +
        '      <a href="#">Show Next Actions</a>' +
        '    </li>' +
        showHistogramMenuHtml +
        filterByMenuHtml +
        '  </ul>' +
        '</div>'
    });
    $(this).popover("show");
    var popover = $(this).data("popover").$tip
    if(node.depth > flow.minDepth() && node.depth == flow.maxDepth()) {
      popover.css("left", popover.position().left - popover.find(".dropdown ul").width())
    }
    popoverNode = node;
    d3.event.stopPropagation();
  }
}

/**
 * Shows a tooltip on mouse over.
 */
function node_onMouseOver(node) {
  if(popoverNode) return;

  $(this).tooltip({
    html: true, container:"body",
    placement: (node.depth == flow.minDepth() ? "right" : "left"),
    title: 
      node.title + "<br/>" +
      "Count: " + Humanize.intcomma(node.value)
  });
  $(this).tooltip("show");
}


//--------------------------------------
// Popup Menu
//--------------------------------------

function showNextActions_onClick() {
  appendToQuery(popoverNode, "action", [1, 1]);
  removePopover();
  return false;
}

function appendToQuery(node, propertyName, within) {
  if(!node) return;

  var name = (within[0] == 0 && within[1] == 0 ? node.depth.toString() + "." + (node.subdepth+1).toString() : (node.depth+1).toString() + ".0");
  var selection = node.selection;
  var condition = selection.parent;
  condition.expression = selection.dimensions[0] + " == '" + node.expressionValue.replace(/'/g, "\\'") + "'";
  condition.removeAllSteps();
  condition.addStep(selection);
  condition.addStep(
    new QueryCondition({expression:"true", within:within, steps:[
      new QuerySelection({name:name, dimensions:[propertyName], fields:[new QuerySelectionField({name:"count", expression:"count()"})]})
    ]})
  );

  landmark.view.load()
}

//--------------------------------------
// Window
//--------------------------------------

/**
 * Updates the view whenever the window is resized.
 */
function window_onResize() {
  landmark.view.update();
}


$(window).resize(window_onResize)
$(document).on("click", ".show-next-actions", showNextActions_onClick);

})();
