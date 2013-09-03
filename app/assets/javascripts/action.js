(function() {
var projectId = 0;
var channels = [], nodes = [], nodeLookup = {}, transitions = [];
var popoverNode = null;
var offset = {x:0, y:0};

var settings = {};

window.landmark.action = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------


layout : { width:0, height:0 },

offset : function(value) {
  if(arguments.length == 0) return offset;
  offset = value;
  var transform = "translate(" + offset.x + "," + offset.y + ")";
  this.g.channels.attr("transform", transform);
  this.g.nodes.attr("transform", transform);
  this.g.transitions.attr("transform", transform);
},

channels : function(value) {
  if(arguments.length == 0) return channels;
  channels = value;
},

node : function(channel, resource, action) {
  if(!nodeLookup[channel] || !nodeLookup[channel][resource]) return null;
  return nodeLookup[channel][resource][action];
},

nodes : function(value) {
  if(arguments.length == 0) return nodes;
  nodes = value;
  nodeLookup = {};

  // Create lookup.
  for(var i=0; i<nodes.length; i++) {
    var node = nodes[i];
    node.id = [node.__channel__, node.__resource__, node.__action__].join("---");
    if(!nodeLookup[node.__channel__]) nodeLookup[node.__channel__] = {};
    if(!nodeLookup[node.__channel__][node.__resource__]) nodeLookup[node.__channel__][node.__resource__] = {};
    nodeLookup[node.__channel__][node.__resource__][node.__action__] = node
  }
},

transitions : function(value) {
  if(arguments.length == 0) return transitions;
  transitions = value;

  for(var i=0; i<transitions.length; i++) {
    var transition = transitions[i];
    transition.source = this.node(transition.__prev_channel__, transition.__prev_resource__, transition.__prev_action__);
    transition.target = this.node(transition.__channel__, transition.__resource__, transition.__action__);
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
  
  this.chart = $("#chart")[0];
  this.svg = {};
  this.svg = d3.select(this.chart).append("svg").attr("class", "focus");
  this.g = {
    root: this.svg.append("g")
  }
  this.g.channels = this.g.root.append("g");
  this.g.transitions = this.g.root.append("g");
  this.g.nodes = this.g.root.append("g");

  var drag = d3.behavior.drag()
    .on("drag", function() {
      $this.offset({
        x: offset.x + d3.event.dx,
        y: offset.y + d3.event.dy
      });
    });
  this.g.root.append("rect").call(drag)
    
  this.update();
  this.load();
},


//--------------------------------------
// Data
//--------------------------------------

load : function() {
  var $this = this;
  d3.json("/api/v1/projects/" + this.projectId + "/actions/query",
    function(error, json) {
      if(error) return console.warn(error);
      $this.layout.width = json.width;
      $this.layout.height = json.height;

      $this.channels(json.channels);
      $this.nodes(json.nodes);
      $this.transitions(json.transitions);

      var h = window.innerHeight - $(this.chart).offset().top - 40;
      $this.offset({x:10, y:((h/2)-($this.layout.height/2))});
      $this.update();
    }
  );
},


//--------------------------------------
// Refresh
//--------------------------------------

update : function() {
  var $this = this;
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

updateChannels : function(w, h) {
  var $this = this;

  this.g.channels.selectAll(".node")
    .data(this.channels(), function(d) { return d.id; })
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
        .attr("width", function(d) { return d.width })
        .attr("height", function(d) { return d.height })
      ;
      selection.select("text.title")
        .attr("x", function(d) { return d.label_x - d.x })
        .attr("y", function(d) { return d.label_y - d.y - 2 })
        .text(function(d) { return d.__action__; })
      ;

      exit.remove();
    }
  );
},

updateTransitions : function(w, h) {
  var $this = this;

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
            .attr("stroke-width", function(d) { return 2 })
          ;
          this.select("polygon.arrowhead")
            .transition()
            .attr("stroke", "black")
            .attr("fill", "black")
            .attr("points", function(d) { return d.arrowhead })
          ;
          this.append("text")
            .attr("text-anchor", "middle")
          ;
        })
      ;

      selection.select("text")
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
},

showNodeActions_onClick : function() {
  this.removePopover();
},

}

var onresize = window.onresize;
window.onresize = function() {
  landmark.action.onresize();
  if(typeof(onresize) == "function") onresize();
}

})()
