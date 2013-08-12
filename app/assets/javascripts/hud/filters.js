(function() {

window.landmark.hud.filters = {

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
    .attr("class", "landmark-hud-filters")
    .attr("width", "0px")
    .attr("height", "0px");

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

}

})();
