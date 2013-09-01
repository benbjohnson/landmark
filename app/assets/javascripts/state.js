(function() {
var states = [], statesById = {};
var replay = {id:1, unit:"seconds"}; // null;
var currentIndex = 0;
var root = null, maxTransitionValue = 0;
var data = [], transitions = [];
var popoverNode = null;
var brush = d3.svg.brush();

var settings = {};
settings.brush = {height:10};

window.landmark.state = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------

projectId : 0,

data : [],

layout : { width:0, height:0 },

replay : function(value) {
  if(arguments.length == 0) return replay;
  if(!value) value = null;
  replay = value;
},

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

  // Order states from left to right and index them.
  var sorted = states.sort(function(a,b) { return a.x > b.x ? 1 : -1});
  states.forEach(function(state) { state.xIndex = sorted.indexOf(state) });

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

  $(document).on("click", function() { $this.document_onClick() });
  $(document).on("click", ".show-replay", function() { $this.showReplay_onClick(popoverNode) });
  $(document).on("click", ".show-node-actions", function() { this.showNodeActions_onClick(popoverNode) });
  
  this.chart = $("#chart")[0];
  this.svg = {};
  this.svg.focus = d3.select(this.chart).append("svg").attr("class", "focus");
  this.svg.context = d3.select(this.chart).append("svg").attr("class", "context");
  this.g = {
    transitions: this.svg.focus.append("g"),
    states: this.svg.focus.append("g"),
    brush: this.svg.context.append("g"),
  };
  this.g.brush.append("g").attr("class", "brush-background"),
  this.g.brush.append("g").attr("class", "brush"),

  this.update();
  this.load();
},


//--------------------------------------
// Data
//--------------------------------------

load : function() {
  var $this = this;
  var params = "";
  if(replay && replay.id) params += "&replay_from=" + replay.id;
  if(replay && replay.step) params += "&step=" + replay.step;
  if(replay && replay.duration) params += "&duration=" + replay.duration;
  if(replay && replay.unit) params += "&unit=" + replay.unit;
  d3.json("/api/v1/projects/" + this.projectId + "/states/query?" + params,
    function(error, json) {
      if(error) return console.warn(error);
      $this.layout.width = json.width;
      $this.layout.height = json.height;

      $this.replay(json.replay);

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
  var $this = this;
  var w = $(this.chart).width();
  var h = window.innerHeight - $(this.chart).offset().top - 40;

  this.svg.focus.attr("height", (h - settings.brush.height));
  this.svg.context.attr("height", settings.brush.height);

  this.updateStates(w, h);
  this.updateTransitions(w, h);
  this.updateBrush(w, h);
},

updateStates : function(w, h) {
  var $this = this;

  this.g.states.attr("transform", "translate(10," + (((h-settings.brush.height)/2)-(this.layout.height/2)) + ")");

  this.g.states.selectAll(".state")
    .data(this.states(), function(d) { return d.id; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();

      selection
        .transition()
          .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; });

      enter.append("g")
        .attr("class", "state")
        .on("click", function(d) { $this.node_onClick(d) })
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
},

updateTransitions : function(w, h) {
  var $this = this;

  this.g.transitions.attr("transform", "translate(10," + (((h-settings.brush.height)/2)-(this.layout.height/2)) + ")");

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
          this.append("text")
            .attr("x", function(d) { return d.label_x })
            .attr("y", function(d) { return d.label_y })
            .attr("text-anchor", "middle")
          ;
        })
      ;

      selection.select("text")
        .text(function(d) {
          return Humanize.intcomma(d.indices[currentIndex] ? d.indices[currentIndex].count : 0);
        })
      ;

      exit.remove();
    }
  );
},

updateBrush : function(w, h) {
  var $this = this;

  var data = [];
  states.forEach(function(state) {
    for(var index in state.indices) {
      data.push({state:state, index:parseInt(index), count:state.indices[index].count});
    }
  });

  var scales = {};
  scales.linear = {};
  scales.linear.x = d3.scale.linear()
    .domain(d3.extent(data, function(d) { return d.index }))
    .range([0, w])
  ;
  scales.x = d3.scale.ordinal()
    .domain(data.map(function(d) { return d.index }).sort())
    .rangeRoundBands([0, w])
  ;
  scales.y = d3.scale.ordinal()
    .domain(states.map(function(d) { return d.xIndex }).sort())
    .rangeRoundBands([0, settings.brush.height])
  ;
  scales.opacity = d3.scale.linear()
    .domain(d3.extent(data, function(d) { return d.count }))
    .range([0.5, 1])
  ;

  brush  
    .x(scales.x)
    .extent([scales.linear.x(currentIndex), scales.linear.x(currentIndex+1)])
    .on("brush", function(d) {
      currentIndex = Math.round(scales.linear.x.invert(brush.extent()[0]))
      $this.update();
    });

  this.g.brush.select(".brush-background").selectAll(".state-index")
    .data(data, function(d) { return d.state.id + "-" + d.index; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();
      enter.append("rect")
        .attr("class", "state-index")
      ;

      selection
        .attr("x", function(d) { return scales.x(d.index) })
        .attr("y", function(d) { return scales.y(d.state.xIndex) })
        .attr("width", function(d) { return scales.x.rangeBand() })
        .attr("height", function(d) { return scales.y.rangeBand() })
        .attr("stroke", "white")
        .attr("stroke-opacity", 0)
        //.attr("fill-opacity", function(d) { return scales.opacity(d.count) })
      ;
    })
  ;
  this.g.brush.select(".brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", 0)
      .attr("height", settings.brush.height);
  ;
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
      '    <li class="show-next-actions">' +
      '      <a class="show-replay" href="#">Show Replay</a>' +
      '      <a class="show-node-actions" href="#">Show Actions</a>' +
      '      <a href="' + window.location.pathname + '/' + d.id + '/edit">Edit State</a>' +
      '      <a href="' + window.location.pathname + '/' + d.id + '" data-method="delete" data-confirm="Are you sure?">Remove State</a>' +
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

showReplay_onClick : function(d) {
  this.removePopover();
  this.replay({id:d.id});
  this.load()
},

showNodeActions_onClick : function() {
  this.removePopover();
},

}

var onresize = window.onresize;
window.onresize = function() {
  landmark.state.onresize();
  if(typeof(onresize) == "function") onresize();
}

})()
