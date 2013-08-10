(function() {

window.landmark.hud.overlay = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------

enabled: false,


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
    .attr("class", "landmark-hud-overlay");
  this.g = this.svg.append("g");
  this.rect = this.g.append("rect");

  this.svg.append("filter")
    .attr("id", "dropshadow")
    .attr("height", "130%")
    .call(function() {
      this.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", "1");
      this.append("feOffset")
        .attr("dx", "2")
        .attr("dy", "2")
        .attr("result", "offsetblur");
      this.append("feMerge")
        .call(function() {
          this.append("feMergeNode");
          this.append("feMergeNode").attr("in", "SourceGraphic");
        });
    });
},


//--------------------------------------
// Refresh
//--------------------------------------

update : function(w, h) {
  this.svg
    .style("left", "0px")
    .style("top", "0px")
    .attr("width", (this.enabled ? w : 0))
    .attr("height", (this.enabled ? h : 0))
  ;
  this.rect
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", (this.enabled ? w : 0))
    .attr("height", (this.enabled ? h : 0))
    .attr("fill", "#000000")
    .transition()
      .attr("opacity", (this.enabled ? 0.3 : 0))
  ;
},

}

})();

