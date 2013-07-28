(function() {

var hud = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------

menu : {
  opened:false,
  items:[
    {id:"page_actions", label:"View Page Actions"},
    {id:"hide", label:"Hide"}
  ],
  itemHeight:30,
  gap:1,
  borderThickness:2
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
  var $this = this;
  
  this.menu.svg = d3.select("body").append("svg")
    .attr("class", "landmark-hud-menu")
    .style("position", "fixed")
    .style("z-index", 10000);
  this.menu.g = this.menu.svg.append("g")
    .attr("transform", "translate(5, 5)")
    .style("cursor", "hand")
    .on("click", function(d) {
      $this.menu.opened = !$this.menu.opened;
      $this.update();
    });
  this.menu.rect = this.menu.g.append("rect")
    .style("stroke", "#0b7359")
    .style("stroke-width", this.menu.borderThickness + "px")
    .style("fill", "white");
  this.menu.icon = this.menu.g.append("svg:image")
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
  var w = window.innerWidth || document.documentElement.clientWidth;
  var h = window.innerHeight || document.documentElement.clientHeight;
  this.updateMenu(w, h);
},

updateMenu : function(w, h) {
  var opened = this.menu.opened;
  var menuWidth = opened ? 200 : 40;
  var menuHeight = opened ? 200 : 40;

  // Update button.
  this.menu.svg
    .transition()
    .style("top", h-menuHeight-20)
    .style("left", 15);

  this.menu.icon
    .transition()
    .attr("x", 5)
    .attr("y", menuHeight-34);

  this.menu.rect
    .transition()
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", menuWidth)
    .attr("height", menuHeight)
    .attr("rx", opened ? 0 : 20)
    .attr("ry", opened ? 0 : 20);

  // Update menu items.
  this.updateMenuItems(w, h, menuWidth, menuHeight);
},

updateMenuItems : function(w, h, menuWidth, menuHeight) {
  var $this = this;
  var opened = this.menu.opened;
  var items = opened ? this.menu.items : [];

  this.menu.svg.selectAll(".landmark-hud-menu-item")
    .data(items, function(d) { return d.id; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();
      enter.append("g")
        .attr("class", "landmark-hud-menu-item")
        .attr("transform", "translate(5, 5)")
        .attr("opacity", 0)
        .call(function() {
          this.transition().delay(function(d, i) { return 250 + (i*100); })
            .attr("opacity", 1)
        })
      .append("rect")
        .style("fill", "#0b7359");
      
      selection.select("rect")
        .attr("x", $this.menu.borderThickness)
        .attr("y", function(d, i) { return $this.menu.borderThickness + (i*($this.menu.itemHeight + $this.menu.gap)); })
        .attr("width", menuWidth - ($this.menu.borderThickness * 2))
        .attr("height", $this.menu.itemHeight)

      exit.remove();
    })
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
