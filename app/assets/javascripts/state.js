(function() {
var states = [], statesById = {};
var root = null, maxDepth = 0, maxTransitionValue = 0, depths = {};
var data = [], transitions = [];
var scales = {
  transitions: d3.scale.linear()
};

var settings = {};
settings.state = {
  width:160,
  height:40,
  padding:{top:20, bottom:20, left:40, right:40}
}

//------------------------------------------------------------------------------
//
// Private Functions
//
//------------------------------------------------------------------------------

function curve() {
  var curvature = .5;

  function link(d) {
    var xi = d3.interpolateNumber(d.x0, d.x1);
    var x2 = xi(curvature);
    var x3 = xi(1 - curvature);
    
    return "M" + d.x0 + "," + d.y0
         + "C" + x2 + "," + d.y0
         + " " + x3 + "," + d.y1
         + " " + d.x1 + "," + d.y1;
  }

  link.curvature = function(_) {
    if (!arguments.length) return curvature;
    curvature = +_; return link;
  };

  return link;
}


window.landmark.state = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------

projectId : 0,

data : [],

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
      $this.states(json.states);

      var transitions = [];
      for(var id in json.results) {
        var target = $this.state(parseInt(id));
        if(target) {
          var source = $this.state(target.parent_id);
          var transitionId = target.parent_id + "-" + id;
          transitions.push({id:transitionId, target:target, source:source, value:json.results[id]});
        }
      }
      $this.transitions(transitions);

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

  this.layout(w, h);

  this.svg.attr("height", h);

  this.g.states.selectAll(".state")
    .data(this.states(), function(d) { return d.id; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();

      selection.transition()
        .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; });

      enter.append("g")
        .attr("class", "state")
        .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; })
        .call(function() {
          this.append("rect");

          this.append("text")
            .attr("dy", "1em")
            .attr("x", settings.state.width/2)
            .attr("y", 10)
            .attr("text-anchor", "middle");
        });

      selection.select("rect")
        .attr("width", settings.state.width)
        .attr("height", settings.state.height)
      ;
      selection.select("text")
        .text(function(d) { return d.name; })
      ;

      exit.remove();
    }
  );

  this.g.transitions.selectAll(".transition")
    .data(this.transitions(), function(d) { return d.id; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();

      enter.append("g")
        .attr("class", "transition")
        .call(function() {
          this.append("title");
          this.append("path")
        })
      ;

      selection
        .call(function() {
          this.select("title")
            .text(function(d) { return Humanize.intcomma(d.value.count) + " users" })
          ;
          this.select("path")
            .transition()
            .attr("d", curve())
            .attr("stroke-width", function(d) { return d.dy })
          ;
        })
      ;

      exit.remove();
    }
  );
},

layout : function(w, h) {
  scales.transitions
    .domain(d3.extent(transitions, function(d) { return d.value.count }))
    .range([0, settings.state.height])
  ;

  for(var i=0; i<states.length; i++) {
    var state = states[i];
    var siblings = depths[state.depth];
    var index = siblings.indexOf(state);
    var siblingHeight = siblings.length * (settings.state.padding.top + settings.state.padding.bottom + settings.state.height);

    state.x = settings.state.padding.left + (state.depth * (settings.state.padding.left + settings.state.width + settings.state.padding.right));
    state.y = (h/2) - (siblingHeight/2) + (index * (settings.state.padding.top + settings.state.padding.bottom + settings.state.height)) + settings.state.padding.top;
  }

  for(var i=0; i<transitions.length; i++) {
    var transition = transitions[i];
    transition.dy = Math.max(1, Math.round(scales.transitions(transition.value.count)));
    transition.x0 = Math.round(transition.source ? transition.source.x + settings.state.width : 0);
    transition.y0 = Math.round(transition.source ? transition.source.y  + (settings.state.height / 2) : h/2);
    transition.x1 = Math.round(transition.target.x);
    transition.y1 = Math.round(transition.target.y + (settings.state.height/2));
  }
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
