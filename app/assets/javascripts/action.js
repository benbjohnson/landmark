(function() {
var states = [], statesById = {};
var replay = null
var replayFunc = null
var currentIndex = 0;
var root = null, maxTransitionValue = 0;
var data = [], transitions = [];
var popoverNode = null;
var brush = d3.svg.brush();

var settings = {};
settings.brush = {height:20};
settings.brush.label = {width:60, padding:{left:2}};

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
  $(document).on("click", ".show-node-actions", function() { $this.showNodeActions_onClick(popoverNode) });
  $("#replay-play").on("click", function(event) { $this.replayPlay_onClick(); event.preventDefault(); });
  $("#replay-close").on("click", function(event) { $this.replayClose_onClick(); event.preventDefault(); });
  
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
  this.g.brush.append("g").attr("class", "label");
  this.g.brush.select(".label").append("rect");
  this.g.brush.select(".label").append("text");

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

  if(replay) {
    $("#replay-toolbar").show();
    $("#replay-play i").attr("class", (replayFunc ? "fui-pause" : "fui-play"))
  } else {
    $("#replay-toolbar").hide();
  }

  var bh = (replay ? settings.brush.height : 0);
  this.svg.focus.attr("height", (h - bh));
  this.svg.context.attr("height", bh);

  this.updateStates(w, h);
  this.updateTransitions(w, h);
  this.updateBrush(w, h);
},

updateStates : function(w, h) {
  var $this = this;

  var bh = (replay ? settings.brush.height : 0);
  this.g.states.attr("transform", "translate(10," + (((h-bh)/2)-(this.layout.height/2)) + ")");

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
            .attr("class", "title")
            .attr("text-anchor", "middle")
          ;

          this.append("text")
            .attr("class", "subtitle")
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
        .attr("y", function(d) { return d.label_y - d.y - (replay ? 7 : 2) })
        .text(function(d) { return d.name; })
      ;
      selection.select("text.subtitle")
        .attr("x", function(d) { return d.label_x - d.x })
        .attr("y", function(d) { return d.label_y - d.y + 6 })
        .text(function(d) { return replay && d.indices[currentIndex] ? Humanize.intcomma(d.indices[currentIndex].count) : ""; })
      ;

      exit.remove();
    }
  );
},

updateTransitions : function(w, h) {
  var $this = this;

  var bh = (replay ? settings.brush.height : 0);
  this.g.transitions.attr("transform", "translate(10," + (((h-bh)/2)-(this.layout.height/2)) + ")");

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

  this.svg.context.style("display", replay ? "block" : "none");

  var bw = w - settings.brush.label.width;

  var scales = {};
  scales.linear = {};
  scales.linear.x = d3.scale.linear()
    .domain(d3.extent(data, function(d) { return d.index }))
    .range([0, bw])
  ;
  scales.x = d3.scale.ordinal()
    .domain(data.map(function(d) { return d.index }).sort())
    .rangeRoundBands([0, bw])
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
  this.g.brush.select(".background").remove();
  this.g.brush.select(".resize").remove();

  var quantity = Math.round(currentIndex * (replay ? replay.step : 0)) + 1;
  var unit = (replay && replay.unit ? replay.unit.toLowerCase() : null);
  if(unit == "second") unit = "sec";
  if(unit == "minute") unit = "min";
  unit +=  (unit && quantity != 1 ? "s" : "");
  this.g.brush.select(".label")
    .attr("display", replay ? "block" : "none")
    .call(function() {
      this.select("rect")
        .attr("x", w - settings.brush.label.width + settings.brush.label.padding.left)
        .attr("width", settings.brush.label.width)
        .attr("height", settings.brush.height)
      ;
      this.select("text")
        .attr("x", w - (settings.brush.label.width/2))
        .attr("y", 13)
        .attr("width", settings.brush.label.width)
        .text(replay ? quantity + " " + unit : "")
      ;
    })
  ;
},


//--------------------------------------
// Replay
//--------------------------------------

play : function() {
  var $this = this;
  replayFunc = function() {
    if(!replayFunc) return;
    currentIndex++;
    if(currentIndex >= replay.duration) currentIndex = 0;
    $this.update();
    setTimeout(function() { if(replayFunc) replayFunc() }, 200);
  }
  replayFunc();
},

pause : function() {
  replayFunc = null;
  this.update();
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
      '      <div class="divider"></div>' +
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
  this.replay({id:d.id, step:1, duration:30, unit:"second"});
  this.load()
},

replayPlay_onClick : function(d) {
  if(replayFunc) {
    this.pause();
  } else {
    this.play();
  }
},

replayClose_onClick : function(d) {
  this.pause();
  replay = null;
  this.load();
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
