(function() {

window.landmark.hud.flow = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------

current: null,

steps: [],

recording : function() {
  return (this.current != null);
},

//------------------------------------------------------------------------------
//
// Public Methods
//
//------------------------------------------------------------------------------

//--------------------------------------
// Initialization
//--------------------------------------

initialize : function() {
  this.svg = d3.select("body").append("svg")
    .attr("class", "landmark-hud-flow");

  this.g = this.svg.append("g")
    .attr("filter", "url(#dropshadow)")
  ;

  // Retrieve current recording id.
  this.getCurrentFlow();
},


//--------------------------------------
// Refresh
//--------------------------------------

update : function(w, h) {
  var $this = this;
  var visible = this.recording() && !landmark.hud.menu.opened;
  var steps = [];
  if(visible) {
    var index = 0;
    this.current.steps.concat({type:"add"}).forEach(function(step) {
      step._index = index++;
      steps.push(step);
    });
  }

  var zIndex = 10010;
  var padding = 15;
  var maxStepWidth = 300;
  var stepWidth = Math.round(Math.min(maxStepWidth, (w - (padding*2)) / steps.length));
  var stepHeight = 40;
  var stepTextLength = stepWidth / 10;

  this.svg
    .transition()
    .style("left", padding)
    .style("top", h-60)
  ;

  // Create the step rects
  this.g.selectAll(".landmark-hud-flow-step")
    .data(steps.reverse()) //, function(d) { return d._index; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();
      var transformFunc = function(d, i) { return "translate(" + ((d._index*stepWidth)-(d._index*40)+5) + ",5)"};
      var rectWidthFunc = function(d) { return d.type == 'add' ? 80 : stepWidth;}
      selection.attr("transform", transformFunc);
      selection.select("rect")
        .attr("width", rectWidthFunc)
      ;
      enter.append("g")
        .attr("class", "landmark-hud-flow-step")
        .attr("transform", "translate(5,5)")
        .on("click", function(d) { $this.step_onClick(d) } )
        .call(function() {
          this.transition()
            .attr("transform", transformFunc);
          this.append("rect")
            .attr("width", 40)
            .attr("height", stepHeight)
            .attr("rx", 20)
            .attr("ry", 20)
            .attr("width", rectWidthFunc)
          this.append("svg:image")
            .attr("xlink:href", "/assets/plus-20x20.png")
            .attr("x", 47)
            .attr("y", 9)
            .attr("width", 20)
            .attr("height", 20);
          this.append("text")
            .attr("dy", "1em")
            .attr("x", 45)
            .attr("y", 12);
        });
      selection.select("rect")
        .attr("class", function(d) { return d.type == 'add' ? "landmark-hud-flow-add-step" : "";})
      selection.select("text")
        .text(function(d) { return d.type == 'add' ? '' : landmark.hud.ellipsize(d.resource, stepTextLength); });
      exit.remove();
    })
},


//--------------------------------------
// Flow
//--------------------------------------

getCurrentFlow : function() {
  var $this = this;
  d3.json(landmark.baseUrl() + "/api/v1/flows/current?apiKey=" + encodeURIComponent(landmark.apiKey),
    function(error, json) {
      if(error) return landmark.log(error);
      $this.current = (!json || Object.keys(json).length == 0 ? null : json);
      landmark.hud.menu.setMenuItemVisible("record_flow", !$this.recording());
      landmark.hud.menu.setMenuItemVisible("stop_flow", $this.recording());
      landmark.hud.update();
    }
  );
},

setCurrentFlow : function(id) {
  var $this = this;
  var xhr = d3.json(landmark.baseUrl() + "/api/v1/flows/set_current?apiKey=" + encodeURIComponent(landmark.apiKey) + "&id=" + encodeURIComponent(id));
  xhr.header('Content-Type', 'application/json');
  xhr.post(null, function(error, json) {
    if(error) return landmark.log(error);
    $this.current = (!json || Object.keys(json).length == 0 ? null : json);
    landmark.hud.menu.setMenuItemVisible("record_flow", !$this.recording());
    landmark.hud.menu.setMenuItemVisible("stop_flow", $this.recording());
    landmark.hud.menu.opened = false;
    landmark.hud.update();
  });
},

createFlow : function(name) {
  var $this = this;
  var xhr = d3.json(landmark.baseUrl() + "/api/v1/flows?apiKey=" + encodeURIComponent(landmark.apiKey));
  xhr.header('Content-Type', 'application/json');
  xhr.post(JSON.stringify({"name":name}), function(error, json) {
    if(error) {
      var response = {};
      try { response = JSON.parse(error.response); } catch(e) {}
      if(response.name) {
        return alert("The '" + name + "' flow already exists. Please try a different name.");
      } else {
        return landmark.log(error);
      }
    }
    $this.setCurrentFlow(json.id);
  });
},

setFlowRecordingState : function(recording) {
  if(recording) {
    var name = prompt("Please name this flow:");
    if(!name) {
      landmark.hud.menu.opened = false;
      landmark.hud.update();
      return;
    }

    this.createFlow(name);

  } else {
    this.setCurrentFlow(0);
  }
},

//--------------------------------------
// Flow Steps
//--------------------------------------

createFlowStep : function(data) {
  if(!this.recording()) return landmark.log("Cannot create new step while recording is stopped.");
  var $this = this;
  var xhr = d3.json(landmark.baseUrl() + "/api/v1/flows/" + this.current.id + "/steps?apiKey=" + encodeURIComponent(landmark.apiKey));
  xhr.header('Content-Type', 'application/json');
  xhr.post(JSON.stringify({"step":data}), function(error, json) {
    if(error) return landmark.log(error);
    $this.current.steps.push(json)
    landmark.hud.update();
  });
},


//--------------------------------------
// Event handlers
//--------------------------------------

step_onClick : function(d) {
  if(d.type == "add") {
    this.createFlowStep({"resource":landmark.resource()})
    landmark.hud.update();
  }
},

}

})()
