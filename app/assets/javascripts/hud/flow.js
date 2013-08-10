(function() {

window.landmark.hud.flow = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------

all : [],

_current: null,

current : function(v) {
  if(arguments.length == 0) return this._current;

  var previd = (this._current ? this._current.id : 0);
  this._current = (!v || Object.keys(v).length == 0 ? null : v);
  landmark.hud.menu.setMenuItemVisible("new_flow", !this.recording());
  landmark.hud.menu.setMenuItemVisible("hide_flow", this.recording());

  var id = (this._current ? this._current.id : 0);
  if(previd != id) {
    var xhr = d3.json(landmark.baseUrl() + "/api/v1/flows/set_current?apiKey=" + encodeURIComponent(landmark.apiKey) + "&id=" + encodeURIComponent(id));
    xhr.header('Content-Type', 'application/json');
    xhr.post();
  }
},

recording : function() {
  return (this.current() != null);
},

data: [],

//------------------------------------------------------------------------------
//
// Public Methods
//
//------------------------------------------------------------------------------

//--------------------------------------
// Initialization
//--------------------------------------

initialize : function() {
  var $this = this;

  this.svg = d3.select("body").append("svg")
    .attr("class", "landmark-hud-flow");

  this.g = {};
  this.g.chart = this.svg.append("g");
  this.g.steps = this.svg.append("g")
    .attr("filter", "url(#dropshadow)")
  ;

  // Retrieve a list of all flows.
  d3.json(landmark.baseUrl() + "/api/v1/flows?apiKey=" + encodeURIComponent(landmark.apiKey),
    function(error, json) {
      if(error) return landmark.log(error);
      $this.all = json || [];
    }
  );

  // Retrieve current recording flow.
  d3.json(landmark.baseUrl() + "/api/v1/flows/current?apiKey=" + encodeURIComponent(landmark.apiKey),
    function(error, json) {
      if(error) return landmark.log(error);
      $this.current(json);
      $this.load()
    }
  );
},

load : function() {
  var $this = this;
  if(!this.current()) return;
  d3.json(landmark.baseUrl() + "/api/v1/flows/" + this.current().id + "?apiKey=" + encodeURIComponent(landmark.apiKey),
    function(error, json) {
      if(error) return landmark.log(error);
      $this.current(json);
      $this.query($this.current().id);
    }
  );
},


//--------------------------------------
// Refresh
//--------------------------------------

update : function(w, h) {
  var visible = this.recording() && !landmark.hud.menu.opened;
  var steps = [];
  if(visible) {
    steps = this.current().steps.map(function(step, index) {
      step.index = index;
      return step;
    });
  }

  var maxStepWidth = 300;
  var options = {};
  options.visible = visible;
  options.padding = 15;
  options.marginBottom = 20;
  options.stepWidth = Math.round(Math.min(maxStepWidth, (w - (options.padding*2)) / steps.length));
  options.stepHeight = 40;
  options.stepTextLength = options.stepWidth / 10;
  options.maxBarHeight = 60;

  this.svg
    .transition()
    .style("left", options.padding)
    .style("top", h-options.marginBottom-options.stepHeight-options.maxBarHeight)
  ;

  this.updateSteps(w, h, steps, options);
  this.updateChart(w, h, steps, options);
},

updateSteps : function(w, h, steps, options) {
  var $this = this;

  if(options.visible) {
    steps = steps.slice();
    steps.push({type:"add", index:steps.length});
  }

  this.g.steps
    .attr("transform", "translate(0," + options.maxBarHeight + ")")
  ;

  // Create the step rects
  this.g.steps.selectAll(".landmark-hud-flow-step")
    .data(steps.reverse(), function(d) { return d.id; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();
      var transformFunc = function(d, i) { return "translate(" + ((d.index*options.stepWidth)-(d.index*40)+5) + ",5)"};
      var rectWidthFunc = function(d) { return d.type == 'add' ? 80 : options.stepWidth;}
      selection.attr("transform", transformFunc);
      selection.select("rect")
        .attr("width", rectWidthFunc)
      ;
      enter.insert("g", ":first-child")
        .attr("class", "landmark-hud-flow-step")
        .attr("transform", "translate(5,5)")
        .on("click", function(d) { $this.step_onClick(d) } )
        .call(function() {
          this
            .attr("transform", transformFunc);
          this.append("rect")
            .attr("width", 40)
            .attr("height", options.stepHeight)
            .attr("rx", 20)
            .attr("ry", 20)
            .attr("width", rectWidthFunc)
          this.append("svg:image")
            .attr("class", function(d) { return d.type == "add" ? "landmark-hud-flow-add-image" : "landmark-hud-flow-remove-image"} )
            .attr("xlink:href", function(d) { return d.type == "add" ? "/assets/plus-20x20.png" : "/assets/minus-black-20x20.png"})
            .attr("x", function(d) { return d.type == "add" ? 47 : rectWidthFunc(d) - 35})
            .attr("y", 9)
            .attr("width", 20)
            .attr("height", 20)
            .on("click", function(d) { if(d.type != "add") $this.removeFlowStep(d) } )
          this.append("text")
            .attr("dy", "1em")
            .attr("x", 45)
            .attr("y", 12);
        });
      selection.order();
      selection.select("rect")
        .attr("class", function(d) { return d.type == 'add' ? "landmark-hud-flow-add-step" : "";})
      selection.select("text")
        .text(function(d) { return d.type == 'add' ? '' : landmark.hud.ellipsize(d.resource, options.stepTextLength); });
      exit.remove();
    })
},

updateChart : function(w, h, steps, options) {
  var $this = this;
  var barWidth = Math.min(150, options.stepWidth - 60);

  var values = steps.map(function(d) { var obj = $this.data[d.index.toString()]; return obj ? obj.count : 0 });
  var y = d3.scale.linear()
    .domain([0, d3.max(values)])
    .range([0, options.maxBarHeight]);

  // Create the bars in the chart.
  this.g.chart.selectAll(".landmark-hud-flow-bar")
    .data(steps.reverse(), function(d) {return d.index})
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();
      enter.append("g")
        .attr("class", "landmark-hud-flow-bar")
        .attr("transform", "translate(5,5)")
        .call(function() {
          this.append("rect")
            .style("fill-opacity", 0)
            .transition().delay(function(d, i) {return (d.index+1) * 100})
              .style("fill-opacity", 1)
          ;
        });
      selection.attr("transform", function(d, i) {
        return "translate(" + ((d.index*options.stepWidth)-(d.index*40)+(options.stepWidth/2)-(barWidth/2)+5) + ",5)"}
      );
      selection.select("rect")
        .attr("class", function(d) { return d.type == 'add' ? "landmark-hud-flow-add-step" : "";})
        .attr("y", function(d) { return options.maxBarHeight - y(values[d.index]) })
        .attr("width", barWidth)
        .attr("height", function(d) { return y(values[d.index]) });
      selection.select("text")
        .text(function(d) { return d.type == 'add' ? '' : landmark.hud.ellipsize(d.resource, options.stepTextLength); });
      exit.remove();
    })
},


//--------------------------------------
// Flow
//--------------------------------------

create : function(name) {
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
    $this.current({id:json.id});
    $this.load();
  });
},


//--------------------------------------
// Flow Steps
//--------------------------------------

createFlowStep : function(data) {
  if(!this.recording()) return landmark.log("Cannot create new step while recording is stopped.");
  var $this = this;
  var xhr = d3.json(landmark.baseUrl() + "/api/v1/flows/" + this.current().id + "/steps?apiKey=" + encodeURIComponent(landmark.apiKey));
  xhr.header('Content-Type', 'application/json');
  xhr.post(JSON.stringify({"step":data}), function(error, json) {
    if(error) return landmark.log(error);
    $this.load();
  });
},

removeFlowStep : function(data) {
  if(!this.recording()) return landmark.log("Cannot create new step while recording is stopped.");
  var $this = this;
  var xhr = d3.xhr(landmark.baseUrl() + "/api/v1/flows/" + this.current().id + "/steps/" + data.id + "?apiKey=" + encodeURIComponent(landmark.apiKey));
  xhr.header('Content-Type', 'application/json');
  xhr.send("DELETE", null, function(error, json) {
    if(error) return landmark.log(error);
    $this.load();
  });
},


//--------------------------------------
// Query
//--------------------------------------

query : function(id) {
  var $this = this;
  d3.json(landmark.baseUrl() + "/api/v1/flows/" + id + "/query?apiKey=" + encodeURIComponent(landmark.apiKey),
    function(error, json) {
      if(error) return landmark.log(error);
      $this.data = json;
      landmark.hud.update();
    }
  );
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
