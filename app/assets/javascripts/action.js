(function() {
var projectId = 0;
var channels = [], nodes = [], nodeLookup = {}, transitions = [];
var funnel = [];
var popoverNode = null;
var scales = {x:d3.scale.linear(), y:d3.scale.linear()};
var translation = {x:0, y:0, scale:1};

var zoom = d3.behavior.zoom()

var settings = {};

window.landmark.action = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------


layout : { width:0, height:0 },

translation : function(value) {
  if(arguments.length == 0) return translation;
  translation = value;
  var transform = "translate(" + translation.x + "," + translation.y + ") scale(" + translation.scale + ")";
  this.g.channels.attr("transform", transform);
  this.g.nodes.attr("transform", transform);
  this.g.transitions.attr("transform", transform);
},

channels : function(value) {
  if(arguments.length == 0) return channels;
  channels = value;
},

node : function(channel, resource, action, eos) {
  if(!nodeLookup[channel] || !nodeLookup[channel][resource] || !nodeLookup[channel][resource][action]) return null;
  return nodeLookup[channel][resource][action][eos];
},

nodes : function(value) {
  if(arguments.length == 0) return nodes;
  nodes = value;
  nodeLookup = {};

  // Create lookup.
  for(var i=0; i<nodes.length; i++) {
    var node = nodes[i];
    node.id = [node.channel, node.resource, node.action, node.eos].join("---");
    if(!nodeLookup[node.channel]) nodeLookup[node.channel] = {};
    if(!nodeLookup[node.channel][node.resource]) nodeLookup[node.channel][node.resource] = {};
    if(!nodeLookup[node.channel][node.resource][node.action]) nodeLookup[node.channel][node.resource][node.action] = {};
    nodeLookup[node.channel][node.resource][node.action][node.eos] = node
  }
},

transitions : function(value) {
  if(arguments.length == 0) return transitions;
  transitions = value;

  for(var i=0; i<transitions.length; i++) {
    var transition = transitions[i];
    transition.source = this.node(transition.prev_channel, transition.prev_resource, transition.prev_action, false);
    transition.target = this.node(transition.channel, transition.resource, transition.action, transition.eos);
  }
},


//------------------------------------------------------------------------------
//
// Public Methods
//
//------------------------------------------------------------------------------

//--------------------------------------
// Initialization
//--------------------------------------

initialize : function(projectId) {
  var $this = this;
  this.projectId = projectId;

  $(document).on("click", function() { $this.document_onClick() });
  $(document).on("click", ".show-next-actions", function() { $this.showNextActions_onClick(popoverNode) });
  $(document).on("click", "#date-filter-apply-btn", function() { $this.dateFilterApplyBtn_onClick() });
  $(document).on("click", ".funnel-step", function() { $this.funnelStep_onClick() });
  $(document).on("click", "#clear-funnel-btn", function() { $this.clearFunnelBtn_onClick() });


  this.chart = $("#chart")[0];
  this.svg = {};
  this.svg = d3.select(this.chart).append("svg").attr("class", "focus");
  this.g = {
    root: this.svg.append("g")
  }

  zoom
    .scaleExtent([0.1, 1])
    .on("zoom", function() {
      $this.translation({
        x: d3.event.translate[0],
        y: d3.event.translate[1],
        scale: d3.event.scale
      });
    });
  this.g.root.append("rect")
    .call(zoom)
    .on("mousedown", function() { d3.event.preventDefault() })

  this.g.channels = this.g.root.append("g");
  this.g.transitions = this.g.root.append("g");
  this.g.nodes = this.g.root.append("g");
    
  this.update();
  this.load();

  var onresize = window.onresize;
  window.onresize = function() {
    landmark.action.onresize();
    if(typeof(onresize) == "function") onresize();
  }
},


//--------------------------------------
// Data
//--------------------------------------

load : function() {
  var $this = this;
  var startDate = $("#start-date").val() != "" ? moment($("#start-date").val()) : null;
  var endDate = $("#end-date").val() != "" ? moment($("#end-date").val()) : null;

  // Update filter description.
  if(startDate && endDate) {
    if(startDate.isSame(endDate)) {
      $("#filter-desc").text("On " + startDate.format("ll"));
    } else {
      $("#filter-desc").text("Between " + startDate.format("ll") + " and " + endDate.format("ll"));
    }
  } else if(startDate) {
    $("#filter-desc").text("Since " + startDate.format("ll"));
  } else if(endDate) {
    $("#filter-desc").text("On or before " + endDate.format("ll"));
  } else {
    $("#filter-desc").text();
  }

  // Create query parameters.
  var data = {"funnel":funnel};
  if(startDate) data.start_date = startDate.toISOString();
  if(endDate) data.end_date = endDate.toISOString();

  var xhr = d3.xhr("/api/v1/projects/" + this.projectId + "/actions/query");
  xhr.header("Content-Type", "application/json");
  xhr.post(JSON.stringify(data),
    function(error, req) {
      if(error) return console.warn(error);
      json = JSON.parse(req.response);

      $this.layout.width = json.width;
      $this.layout.height = json.height;

      $this.channels(json.channels);
      $this.nodes(json.nodes);
      $this.transitions(json.transitions);

      var w = $(this.chart).width();
      var h = window.innerHeight - $(this.chart).offset().top - 40;
      var scale = Math.min(1, w/$this.layout.width);
      zoom.scale(scale);
      zoom.translate([(w/2)-($this.layout.width/2)*scale, 10*scale])
      zoom.event($this.g.root.select("rect"))

      $this.update();
    }
  );
},


//--------------------------------------
// Refresh
//--------------------------------------

update : function() {
  var $this = this;
  this.updateBreadcrumb();

  var w = $(this.chart).width();
  var h = window.innerHeight - $(this.chart).offset().top - 40;

  this.svg.attr("height", h);
  this.g.root.select("rect")
    .attr("fill-opacity", 0)
    .attr("width", w)
    .attr("height", h)
  ;

  this.updateChannels(w, h);
  this.updateNodes(w, h);
  this.updateTransitions(w, h);
},

updateBreadcrumb : function(w, h) {
  var $this = this;
  breadcrumb = $("#breadcrumb")
  breadcrumb.empty();

  for(var i=0; i<funnel.length; i++) {
    var step = funnel[i];
    var item = $('<li><a class="funnel-step" href="#"></a></li>');
    if(i == funnel.length - 1) item.attr("class", "active");
    item.find("a")
      .data("index", i)
      .text(step.resource);
    breadcrumb.append(item);
  }
  breadcrumb.append('<i id="clear-funnel-btn" class="pull-right fui-cross-inverted text-primary"></i>')

  if(funnel.length == 0) {
    breadcrumb.hide();
  } else {
    breadcrumb.show();
  }
},

updateChannels : function(w, h) {
  var $this = this;

  this.g.channels.selectAll(".channel")
    .data(this.channels(), function(d) { return d.name; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();

      selection
        .transition()
          .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; });

      enter.append("g")
        .attr("class", "channel")
        .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; })
        .call(function() {
          this.append("rect");

          this.append("text")
            .attr("class", "title")
            .attr("text-anchor", "middle")
          ;
        }
      );

      selection.select("rect")
        .attr("width", function(d) { return d.width })
        .attr("height", function(d) { return d.height })
      ;
      selection.select("text.title")
        .attr("x", function(d) { return d.label_x - d.x })
        .attr("y", function(d) { return d.label_y - d.y - 2 })
        .text(function(d) { return d.name; })
      ;

      exit.remove();
    }
  );
},

updateNodes : function(w, h) {
  var $this = this;

  this.g.nodes.selectAll(".node")
    .data(this.nodes(), function(d) { return d.id; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();

      selection
        .transition()
          .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; });

      enter.append("g")
        .attr("class", "node")
        .on("click", function(d) { $this.node_onClick(d) })
        .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; })
        .call(function() {
          this.append("rect");

          this.append("text")
            .attr("class", "title")
            .attr("text-anchor", "middle")
          ;
        }
      );

      selection.select("rect")
        .attr("visibility", function(d) { return d.eos == "true" ? "hidden" : "visible" })
        .attr("width", function(d) { return d.width })
        .attr("height", function(d) { return d.height })
      ;
      selection.select("text.title")
        .attr("visibility", function(d) { return d.eos == "true" ? "hidden" : "visible" })
        .attr("x", function(d) { return d.label_x - d.x })
        .attr("y", function(d) { return d.label_y - d.y - 2 })
        .text(function(d) { return d.resource; })
      ;

      exit.remove();
    }
  );
},

updateTransitions : function(w, h) {
  var $this = this;

  var interpolator = {};
  interpolator.opacity = d3.interpolateNumber(0.3, 1);

  this.g.transitions.selectAll(".transition")
    .data(this.transitions(), function(d) { return d.source.id + "---" + d.target.id; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();

      enter.append("g")
        .attr("class", "transition")
        .call(function() {
          this.append("title");
          this.append("path");
          this.append("polygon").attr("class", "arrowhead");
        })
      ;

      selection
        .call(function() {
          this.select("path")
            .transition()
            .attr("d", function(d) { return d.d })
            .attr("stroke", function(d) { return d.eos == "true" ? "#e74c3c" : "#333" })
            .attr("stroke-opacity", function(d) { return interpolator.opacity(d.stroke_width) })
            .attr("stroke-width", function(d) { return Math.max(1, d.stroke_width) })
          ;
          this.select("polygon.arrowhead")
            .transition()
            .attr("stroke", function(d) { return d.eos == "true" ? "#e74c3c" : "#333" })
            .attr("stroke-opacity", function(d) { return interpolator.opacity(d.stroke_width) })
            .attr("fill", function(d) { return d.eos == "true" ? "#e74c3c" : "#333" })
            .attr("fill-opacity", function(d) { return interpolator.opacity(d.stroke_width) })
            .attr("points", function(d) { return d.arrowhead_points })
          ;
          this.append("text")
            .attr("fill", function(d) { return d.eos == "true" ? "#e74c3c" : "#333" })
            .attr("fill-opacity", function(d) { return interpolator.opacity(d.stroke_width) })
            .attr("text-anchor", "middle")
          ;
        })
      ;

      selection.select("text")
        .transition()
        .attr("x", function(d) { return d.label_x })
        .attr("y", function(d) { return d.label_y })
        .text(function(d) { return Humanize.intcomma(d.count); })
      ;

      exit.remove();
    }
  );
},


//--------------------------------------
// Utility
//--------------------------------------

removePopover : function() {
  popoverNode = null;
  $(".popover").remove()
  $(".tooltip").remove()
},


//--------------------------------------
// Events
//--------------------------------------

onresize : function() {
  this.update();
},

document_onClick : function() {
  if($(event.target).attr("rel") == "popover") return;  
  if($(event.target).parents(".popover").length > 0) return;
  this.removePopover();
},

node_onClick : function(d) {
  this.removePopover();
  $(this).popover({
    html: true, container:"body", trigger:"manual",
    placement: "left",
    template: '<div class="popover node-popover"><div class="popover-content"></div></div>',
    content:
      '<div class="dropdown open">' +
      '  <ul class="dropdown-menu dropdown-inverse">' +
      '    <li>' +
      '      <a class="show-next-actions" href="#">Show Next Actions</a>' +
      '    </li>' +
      '  </ul>' +
      '</div>'
  });
  $(this).popover("show");
  popoverNode = d;
  var popover = $(this).data("popover").$tip
  popover.css("left", d3.event.x + 10);
  popover.css("top", d3.event.y + 10);
  d3.event.stopPropagation();
},

showNextActions_onClick : function(d) {
  this.removePopover();
  funnel.push({
    channel:d.channel,
    resource:d.resource,
    action:d.action,
    eos:d.eos,
  });
  this.load()
},

funnelStep_onClick : function() {
  var index = $(event.toElement).data("index");
  funnel = funnel.slice(0, index+1);
  this.load();
},

clearFunnelBtn_onClick : function() {
  funnel = [];
  this.load();
},

dateFilterApplyBtn_onClick : function() {
  this.load();
},

}

})()
