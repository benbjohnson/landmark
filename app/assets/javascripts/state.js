(function() {
var states = [], statesById = {};
var root = null, maxDepth = 0, maxTransitionValue = 0, depths = {};
var data = [], transitions = [];


window.landmark.state = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------

projectId : 0,

data : [],

layout : { width:0, height:0 },

state : function(id) {
  return statesById[id];
},

states : function(value) {
  if(arguments.length == 0) return states;
  states = value;
  statesById = {};

  // Create lookup.
  for(var i=0; i<states.length; i++) {
    statesById[states[i].id] = states[i];
  }

  // Calculate state depth.
  maxDepth = 0, depths = {};
  for(var i=0; i<states.length; i++) {
    var state = states[i];
    var s = state, d = -1;
    while(s) {
      s = statesById[s.parent_id];
      d++
    }
    if(d > maxDepth) maxDepth = d;
    state.depth = d

    if(!depths[d]) depths[d] = [];
    depths[d].push(state);
  }

  this.normalize();
},

transitions : function(value) {
  if(arguments.length == 0) return transitions;
  transitions = value;
  this.normalize();
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

  this.chart = $("#chart")[0];
  this.svg = d3.select(this.chart).append("svg");
  this.g = {
    transitions: this.svg.append("g"),
    states: this.svg.append("g"),
  };

  this.update();
  this.load();
},


//--------------------------------------
// Data
//--------------------------------------

load : function() {
  var $this = this;
  d3.json("/api/v1/projects/" + this.projectId + "/states/query",
    function(error, json) {
      if(error) return console.warn(error);
      $this.layout.width = json.width;
      $this.layout.height = json.height;

      $this.states(json.states);

      for(var i=0; i<json.transitions.length; i++) {
        var transition = json.transitions[i];
        transition.source = $this.state(transition.source);
        transition.target = $this.state(transition.target);
      }
      $this.transitions(json.transitions);

      $this.update();
    }
  );
},

/**
 * Normalizes the links between states.
 */
normalize : function() {
  for(var i=0; i<states.length; i++) {
    states[i].incoming = [];
    states[i].outgoing = [];
  }

  for(var i=0; i<transitions.length; i++) {
    var transition = transitions[i];
    if(transition.source) transition.source.outgoing.push(transition);
    if(transition.target) transition.target.incoming.push(transition);
  }  
},


//--------------------------------------
// Refresh
//--------------------------------------

update : function() {
  var w = $(this.chart).width();
  var h = window.innerHeight - $(this.chart).offset().top - 40;

  this.svg.attr("height", h);

  // Vertically center the layout.
  this.g.states.attr("transform", "translate(10," + ((h/2)-(this.layout.height/2)) + ")");
  this.g.transitions.attr("transform", "translate(10," + ((h/2)-(this.layout.height/2)) + ")");

  this.g.states.selectAll(".state")
    .data(this.states(), function(d) { return d.id; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();

      selection
        .transition()
          .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; });

      enter.append("g")
        .attr("class", "state")
        .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; })
        .call(function() {
          this.append("rect");

          this.append("text")
            .attr("x", function(d) { return d.label_x - d.x })
            .attr("y", function(d) { return d.label_y - d.y - 2 })
            .attr("text-anchor", "middle");
          }
        );

      selection.select("rect")
        .attr("width", function(d) { return d.width })
        .attr("height", function(d) { return d.height })
      ;
      selection.select("text")
        .text(function(d) { return d.name; })
      ;

      exit.remove();
    }
  );

  this.g.transitions.selectAll(".transition")
    .data(this.transitions(), function(d) { return d.source.id + "-" + d.target.id; })
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
          this.select("title")
            .text(function(d) { return Humanize.intcomma(d.count) + " users" })
          ;
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
        })
      ;

      exit.remove();
    }
  );
},


//--------------------------------------
// Events
//--------------------------------------

onresize : function() {
  this.update();
},

}

var onresize = window.onresize;
window.onresize = function() {
  landmark.state.onresize();
  if(typeof(onresize) == "function") onresize();
}

})()
