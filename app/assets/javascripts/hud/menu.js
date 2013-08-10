(function() {

window.landmark.hud.menu = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------

opened: false,

items:[
  {id:"record_flow", label:"Record Flow", visible:true},
  {id:"stop_flow", label:"Stop Recording", visible:false},
  {id:"show_page_actions", label:"Show Page Actions", visible:true},
  {id:"hide_page_actions", label:"Hide Page Actions", visible:false},
  {id:"hide", label:"Hide", visible:true}
],

itemHeight: 30,

gap: 2,

borderThickness: 2,

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
    .attr("class", "landmark-hud-menu");
  this.g = this.svg.append("g")
    .attr("class", "landmark-hud-menu-button")
    .attr("transform", "translate(5, 5)")
    .on("click", function(d) {
      $this.opened = !$this.opened;
      landmark.hud.update();
    });
  this.rect = this.g.append("rect");
  this.icon = this.g.append("svg:image")
    .attr("xlink:href", "/assets/icon-30x30.png")
    .attr("width", 30)
    .attr("height", 30);
},


//--------------------------------------
// Refresh
//--------------------------------------

update : function(w, h) {
  var opened = this.opened;
  var menuWidth = opened ? 200 : 40;
  var menuHeight = 40 + (opened ? (this.getVisibleMenuItems().length * (this.itemHeight + this.gap) + this.gap) : 0);

  // Update button.
  this.svg
    .transition()
    .style("top", h-menuHeight-20)
    .style("left", 15)
    .style("width", menuWidth+8)
    .style("height", menuHeight+8);

  this.icon
    .transition()
    .attr("x", 5)
    .attr("y", menuHeight-34);

  this.rect
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
  var opened = this.opened;
  var items = opened ? this.getVisibleMenuItems() : [];

  this.svg.selectAll(".landmark-hud-menu-item")
    .data(items, function(d) { return d.id; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();
      enter.append("g")
        .attr("class", "landmark-hud-menu-item")
        .attr("transform", "translate(5, 5)")
        .attr("opacity", 0)
        .on("click", function(d) { $this.menuItem_onClick(d) } )
        .call(function() {
          this.transition().delay(function(d, i) { return 250 + (i*100); })
            .attr("opacity", 1)
          ;
          this.append("rect");
          this.append("text")
            .attr("dy", "1em")
            .attr("x", $this.borderThickness + 7)
            .attr("y", function(d, i) { return ($this.borderThickness/2) + (i*($this.itemHeight + $this.gap) + 6); })
            .text(function(d) { return d.label; })
          ;
        })
      ;
      
      selection.select("rect")
        .attr("x", ($this.borderThickness/2) + $this.gap)
        .attr("y", function(d, i) { return ($this.borderThickness/2) + (i*$this.itemHeight) + ((i+1)*$this.gap); })
        .attr("width", menuWidth - $this.borderThickness - ($this.gap * 2))
        .attr("height", $this.itemHeight)
      ;

      exit.remove();
    })
},


//--------------------------------------
// Menu
//--------------------------------------

getVisibleMenuItems : function() {
  return this.items.filter(function(item) { return item.visible; });
},

setMenuItemVisible : function(id, value) {
  for(var i=0; i<this.items.length; i++) {
    var item = this.items[i];
    if(item.id == id) {
      item.visible = value;
    }
  }
},


//--------------------------------------
// Event handlers
//--------------------------------------

menuItem_onClick : function(d) {
  switch(d.id) {
    case "record_flow": landmark.hud.flow.setFlowRecordingState(true); break;
    case "stop_flow": landmark.hud.flow.setFlowRecordingState(false); break;
    case "show_page_actions": landmark.hud.setPageActionsVisible(true); break;
    case "hide_page_actions": landmark.hud.setPageActionsVisible(false); break;
    case "hide": hide(); break;
  }
},

}

})();

