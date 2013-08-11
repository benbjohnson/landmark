(function() {

window.landmark.hud.actions = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------

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
  this.svg = d3.select("body").append("svg")
    .attr("class", "landmark-hud-actions")
    .style("width", 0)
    .style("height", 0)
  ;
},


//--------------------------------------
// Refresh
//--------------------------------------

update : function(w, h) {
  var $this = this;
  var visible = (this.data.length > 0);

  // Only generate a lookup of links if we need them.
  var links = {};
  if(this.data.length > 0) {
    Array.prototype.slice.call(document.getElementsByTagName("a")).forEach(function(link) {
      if(!links[link.href]) links[link.href] = [];
      links[link.href].push(link);
    });
  }

  // Update link positions.
  this.data.forEach(function(item) {
    var link = (links[item.href] ? links[item.href][0] : null);
    item.link = link;
    item.pos = landmark.hud.offset(link);
  });

  // Create the link rects.
  var data = this.data.filter(function(d) { return d.link && d.link.offsetWidth > 0; });
  this.svg.selectAll(".landmark-hud-action-item")
    .data(data, function(d) { return d.id; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();
      selection.select(".landmark-hud-action-item-highlight")
        .attr("width", function(d) { return (d.link ? d.link.offsetWidth : 0); })
        .attr("height", function(d) { return (d.link ? d.link.offsetHeight : 0); })
      ;
      enter.append("g")
        .attr("class", "landmark-hud-action-item")
        .call(function() {
          this.append("rect")
            .attr("class", "landmark-hud-action-item-highlight")
            .attr("width", 0)
            .attr("height", 2)
            .on("click", function(d) { $this.actionItem_onClick(d) } )
            .call(function() {
              this.transition().delay(function(d, i) { return Math.random()*250; })
                .attr("width", function(d) { return (d.link ? d.link.offsetWidth : 0); })
                .transition().delay(500)
                  .attr("height", function(d) { return (d.link ? d.link.offsetHeight : 0); })
            })
        })
        .call(function() {
          this.append("rect")
            .attr("class", "landmark-hud-action-item-stats")
            .attr("y", 0)
            .attr("width", 0)
            .attr("height", 2)
            .call(function() {
              this.transition().delay(250)
                .attr("width", function(d) { return 40; })
                .transition().delay(500)
                  .attr("y", -20)
                  .attr("height", 20)
            })
        })
        .call(function() {
          this.append("text")
            .attr("class", "landmark-hud-action-item-stats")
            .attr("dy", "1em")
            .attr("x", 5)
            .attr("y", -18)
            .attr("opacity", 0)
            .text(function(d) { return Math.round((d.count/$this.total)*100) + "%"; })
            .transition().delay(750)
              .attr("opacity", 1)
        })
      ;
      selection
        .attr("transform", function(d) { return "translate(" + d.pos.left + ", " + d.pos.top + ")"; })
      ;
      exit.remove();
    });

  // Resize the SVG container.
  var documentHeight = (document.height !== undefined) ? document.height : document.body.offsetHeight;
  this.svg
    .style("width", (visible ? null : 0))
    .style("height", (visible ? documentHeight - 20 : 0))
  ;
},


//--------------------------------------
// Page Actions
//--------------------------------------

visible : function(enabled) {
  var $this = this;
  if(enabled) {
    d3.json(landmark.baseUrl() + "/api/v1/resources/next_page_actions?apiKey=" + encodeURIComponent(landmark.apiKey) + "&name=" + encodeURIComponent(landmark.resource()), function(error, json) {
      if(error) return landmark.log(error);
      $this.total = json.count;
      $this.data = $this.normalize(json);
      landmark.hud.update();
    });
  } else {
    this.data = [];
  }

  landmark.hud.overlay.enabled = enabled;
  landmark.hud.menu.opened = false;
  landmark.hud.menu.setMenuItemVisible("show_page_actions", !enabled);
  landmark.hud.menu.setMenuItemVisible("hide_page_actions", enabled);
  landmark.hud.update();
},

normalize : function(data) {
  var $this = this;
  if(!data.__href__) return [];

  // Normalize action data.
  return Object.keys(data.__href__).map(function(href) {
    return {
      id: href,
      href: href,
      count: data.__href__[href].count,
    }
  });
},


//--------------------------------------
// Event handlers
//--------------------------------------

actionItem_onClick : function(d) {
},

}

})();

