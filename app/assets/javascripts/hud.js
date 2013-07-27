(function() {

var hud = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------

go : {opened:false},


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
  
  this.go.svg = d3.select("body").append("svg")
    .attr("class", "landmark-hud")
    .style("position", "fixed")
    .style("z-index", 10000)
    .style("top", 0)
    .style("left", 0);
  this.go.g = this.go.svg.append("g")
    .style("cursor", "hand")
    .on("click", function(d) {
      $this.go.opened = !$this.go.opened;
      $this.update();
    });
  this.go.rect = this.go.g.append("rect")
    .style("stroke", "#0b7359")
    .style("stroke-width", "2px")
    .style("fill", "white");
  this.go.icon = this.go.g.append("svg:image")
    .attr("xlink:href", "/assets/icon-30x30.png")
    .attr("width", 30)
    .attr("height", 30);

  hud.update();
},


//--------------------------------------
// Refresh
//--------------------------------------

/**
 * Redraws the HUD display.
 */
update : function() {
  this.updateRoot();
  this.updateGoButton();
},

updateRoot : function() {
  var width = window.innerWidth || document.documentElement.clientWidth;
  var height = window.innerHeight || document.documentElement.clientHeight;
},

updateGoButton : function() {
  var height = window.innerHeight || document.documentElement.clientHeight;
  var opened = this.go.opened;
  var menuWidth = opened ? 200 : 40;
  var menuHeight = opened ? 200 : 40;

  this.go.icon
    .transition()
    .attr("x", 35)
    .attr("y", (height - 53));

  this.go.rect
    .transition()
    .attr("x", 30)
    .attr("y", (height - 20 - menuWidth))
    .attr("width", menuWidth)
    .attr("height", menuHeight)
    .attr("rx", opened ? 0 : 20)
    .attr("ry", opened ? 0 : 20);
},


//--------------------------------------
// Event handlers
//--------------------------------------

onresize : function() {
  this.update();
},


}


//------------------------------------------------------------------------------
//
// Events
//
//------------------------------------------------------------------------------

if(!landmark) window.landmark = {};
window.landmark.hud = hud;

hud.initialize();

var onresize = window.onresize;
window.onresize = function() {
  hud.onresize();
  if(typeof(onresize) == "function") onresize();
}

})();
