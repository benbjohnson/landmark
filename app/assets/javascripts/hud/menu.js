(function() {

window.landmark.hud.menu = {

//------------------------------------------------------------------------------
//
// Properties
//
//------------------------------------------------------------------------------

opened: false,

items:[
  {id:"new_flow", label:"New Flow", visible:true},
  {id:"hide_flow", label:"Hide Current Flow", visible:false},
  {id:"flows", label:"", visible:true},
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
    .attr("xlink:href", landmark.baseUrl() + "/assets/icon-30x30.png")
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
    .style("top", (h-menuHeight-20) + "px")
    .style("left", "15px")
    .style("width", (menuWidth+8) + "px")
    .style("height", (menuHeight+8) + "px");

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
    .data(items)
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
  var flowItems = landmark.hud.flow.all.map(function(flow) {
    return {id:"show_flow", flow:flow, label:"Show '" + flow.name + "' Flow"};
  })

  items = this.items.filter(function(item) { return item.visible; });
  for(var i=0; i<items.length; i++) {
    if(items[i].id == "flows") {
      items.splice.apply(items, [i, 1].concat(flowItems));
      break;
    }
  }

  return items;
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
    case "new_flow":
      var name = prompt("Please name this flow:");
      if(name) {
        landmark.hud.flow.create(name);
      }
      break;

    case "hide_flow":
      landmark.hud.flow.current(null);
      break;

    case "show_page_actions": landmark.hud.actions.visible(true); break;
    case "hide_page_actions": landmark.hud.actions.visible(false); break;
    case "show_flow":
      landmark.hud.flow.current(d.flow);
      landmark.hud.flow.load();
      break;
    case "hide": hide(); break;
  }

  this.opened = false;
  landmark.hud.update();
},

}

})();

