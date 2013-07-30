(function() {

var hud = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------

overlay : {
  enabled: false
},

menu : {
  opened: false,
  items:[
    {id:"show_page_actions", label:"Show Page Actions", visible:true},
    {id:"hide_page_actions", label:"Hide Page Actions", visible:false},
    {id:"hide", label:"Hide", visible:true}
  ],
  itemHeight: 30,
  gap: 2,
  borderThickness: 2
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
  
  this.overlay.svg = d3.select("body").append("svg")
    .attr("class", "landmark-hud-overlay")
    .style("position", "fixed")
    .style("z-index", 10000);
  this.overlay.g = this.overlay.svg.append("g");
  this.overlay.rect = this.overlay.g.append("rect");

  this.menu.svg = d3.select("body").append("svg")
    .attr("class", "landmark-hud-menu")
    .style("position", "fixed")
    .style("z-index", 10001);
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

update : function() {
  var w = window.innerWidth || document.documentElement.clientWidth;
  var h = window.innerHeight || document.documentElement.clientHeight;
  this.updateOverlay(w, h);
  this.updateMenu(w, h);
},

updateOverlay : function(w, h) {
  this.overlay.svg
    .style("left", "0px")
    .style("top", "0px")
    .attr("width", (this.overlay.enabled ? w : 0))
    .attr("height", (this.overlay.enabled ? h : 0))
  ;
  this.overlay.rect
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", (this.overlay.enabled ? w : 0))
    .attr("height", (this.overlay.enabled ? h : 0))
    .attr("fill", "#000000")
    .transition()
      .attr("opacity", (this.overlay.enabled ? 0.3 : 0))
  ;
},

updateMenu : function(w, h) {
  var opened = this.menu.opened;
  var menuWidth = opened ? 200 : 40;
  var menuHeight = 40 + (opened ? (this.getVisibleMenuItems().length * (this.menu.itemHeight + this.menu.gap) + this.menu.gap) : 0);

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
  var items = opened ? this.getVisibleMenuItems() : [];

  this.menu.svg.selectAll(".landmark-hud-menu-item")
    .data(items, function(d) { return d.id; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();
      enter.append("g")
        .attr("class", "landmark-hud-menu-item")
        .attr("transform", "translate(5, 5)")
        .attr("opacity", 0)
        .style("shape-rendering", "crispEdges")
        .style("cursor", "hand")
        .on("click", function(d) { $this.menuItem_onClick(d) } )
        .call(function() {
          this.transition().delay(function(d, i) { return 250 + (i*100); })
            .attr("opacity", 1)
          ;
          this.append("rect")
            .style("fill", "#0b7359")
          ;
          this.append("text")
            .attr("dy", "1em")
            .attr("x", $this.menu.borderThickness + 7)
            .attr("y", function(d, i) { return ($this.menu.borderThickness/2) + (i*($this.menu.itemHeight + $this.menu.gap) + 6); })
            .attr("font-family", "Helvetica, Arial, sans-serif")
            .attr("font-size", "16px")
            .style("fill", "#ffffff")
            .text(function(d) { return d.label; })
          ;
        })
      ;
      
      selection.select("rect")
        .attr("x", ($this.menu.borderThickness/2) + $this.menu.gap)
        .attr("y", function(d, i) { return ($this.menu.borderThickness/2) + (i*$this.menu.itemHeight) + ((i+1)*$this.menu.gap); })
        .attr("width", menuWidth - $this.menu.borderThickness - ($this.menu.gap * 2))
        .attr("height", $this.menu.itemHeight)
      ;

      exit.remove();
    })
},

//--------------------------------------
// Menu
//--------------------------------------

getVisibleMenuItems : function() {
  return this.menu.items.filter(function(item) { return item.visible; });
},

setMenuItemVisible : function(id, value) {
  for(var i=0; i<this.menu.items.length; i++) {
    var item = this.menu.items[i];
    if(item.id == id) {
      item.visible = value;
    }
  }
},

//--------------------------------------
// Page Actions
//--------------------------------------

showPageActions : function() {
  // TODO: Load page actions.
  this.overlay.enabled = true;
  this.menu.opened = false;
  this.setMenuItemVisible("show_page_actions", false);
  this.setMenuItemVisible("hide_page_actions", true);
  this.update();
},

hidePageActions : function() {
  this.overlay.enabled = false;
  this.menu.opened = false;
  this.setMenuItemVisible("show_page_actions", true);
  this.setMenuItemVisible("hide_page_actions", false);
  this.update();
},


//--------------------------------------
// Event handlers
//--------------------------------------

onresize : function() {
  this.update();
},

menuItem_onClick : function(d) {
  switch(d.id) {
    case "show_page_actions": this.showPageActions(); break;
    case "hide_page_actions": this.hidePageActions(); break;
    case "hide": hide(); break;
  }
}

}


//------------------------------------------------------------------------------
//
// Events
//
//------------------------------------------------------------------------------

if(!landmark) window.landmark = {};
window.landmark.hud = hud;

var onresize = window.onresize;
window.onresize = function() {
  hud.onresize();
  if(typeof(onresize) == "function") onresize();
}

// Load D3 if it's not already on the page.
if(!window.d3) {
  var src = "";
  if(landmark.host() != null) src += ('https:' === document.location.protocol ? 'https://' : 'http://') + landmark.host() + (landmark.port() > 0 ? ":" + landmark.port() : "");
  src += "/assets/d3.js";

  var script = document.createElement('script');
  script.type = "text/javascript";
  script.src = src;
  script.onload = function() {
    hud.initialize();
  };
  landmark.scriptTag.parentNode.insertBefore(script);
}
})();
