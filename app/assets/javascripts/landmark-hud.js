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

actions : {
  data:[]
},

links : {},

MOCK_ACTION_DATA : {
    "__href__":{
      "tel:555-555-5555":3,
      "http://localhost:3000/demo/index.html#menu":10,
      "http://localhost:3000/demo/index.html#menu2":20,
      "http://localhost:3000/demo/erp.html":15,
      "http://localhost:3000/demo/contact_us.html":30,
      "http://localhost:3000/demo/data.html":5
    }
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

  this.actions.svg = d3.select("body").append("svg")
    .attr("class", "landmark-hud-actions")
    .style("position", "absolute")
    .style("left", 0)
    .style("top", 0)
    .style("width", 0)
    .style("height", 0)
    .style("z-index", 10001);
  this.actions.g = this.actions.svg.append("g");

  this.menu.svg = d3.select("body").append("svg")
    .attr("class", "landmark-hud-menu")
    .style("position", "fixed")
    .style("z-index", 10002);
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
  this.updateLinks();
  this.updateOverlay(w, h);
  this.updateMenu(w, h);
  this.updatePageActions(w, h);
},

updateLinks : function() {
  var $this = this;
  this.links = {};

  // Only generate a lookup of links if we need them.
  if(this.actions.data.length > 0) {
    Array.prototype.slice.call(document.getElementsByTagName("a")).forEach(function(link) {
      if(!$this.links[link.href]) $this.links[link.href] = [];
      $this.links[link.href].push(link);
    });
  }
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

updatePageActions : function(w, h) {
  var $this = this;
  var visible = (this.actions.data.length > 0);

  // Update link positions.
  this.actions.data.forEach(function(item) {
    var link = ($this.links[item.href] ? $this.links[item.href][0] : null);
    item.link = link;
    item.pos = $this.offset(link);
  });

  // Resize the SVG container.
  this.actions.svg
    .style("width", (visible ? null : 0))
    .style("height", (visible ? null : 0))
  ;

  // Create the link rects.
  this.actions.g.selectAll(".landmark-hud-action-item")
    .data(this.actions.data, function(d) { return d.id; })
    .call(function(selection) {
      var enter = selection.enter(), exit = selection.exit();
      selection
        .attr("width", function(d) { return (d.link ? d.link.offsetWidth : 0); })
        .attr("height", function(d) { return (d.link ? d.link.offsetHeight : 0); })
      ;
      enter.append("rect")
        .attr("class", "landmark-hud-action-item")
        .attr("width", 0)
        .attr("height", 2)
        .style("fill", "#ffffff")
        .style("fill-opacity", 0.2)
        .style("stroke", "#ffffff")
        .style("stroke-width", 2)
        .style("stroke-opacity", 1)
        .style("shape-rendering", "crispEdges")
        .style("cursor", "hand")
        .on("click", function(d) { $this.actionItem_onClick(d) } )
        .call(function() {
          this.transition().delay(function(d, i) { return Math.random()*250; })
            .attr("width", function(d) { return (d.link ? d.link.offsetWidth : 0); })
            .transition().delay(500)
              .attr("height", function(d) { return (d.link ? d.link.offsetHeight : 0); })
        })
      ;
      selection
        .attr("x", function(d) { return d.pos.left; })
        .attr("y", function(d) { return d.pos.top; })
      ;
      exit.remove();
    });
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

setPageActionsVisible : function(enabled) {
  this.actions.data = (enabled ? this.normalizeActionData(this.MOCK_ACTION_DATA) : []);

  this.overlay.enabled = enabled;
  this.menu.opened = false;
  this.setMenuItemVisible("show_page_actions", !enabled);
  this.setMenuItemVisible("hide_page_actions", enabled);
  this.update();
},

normalizeActionData : function(data) {
  var $this = this;
  if(!data.__href__) return [];

  // Sum the total.
  var total = 0;
  Object.keys(data.__href__).forEach(function(href) {
    total += data.__href__[href];
  });

  // Normalize action data.
  return Object.keys(data.__href__).map(function(href) {
    return {
      id: href,
      href: href,
      count: data.__href__[href],
      total: total,
    }
  });
},


//--------------------------------------
// Utilities
//--------------------------------------

offset : function(obj) {
  var pos = {left:0, top:0};
  if(obj && obj.offsetParent) {
    do {
        pos.left += obj.offsetLeft;
        pos.top += obj.offsetTop;
    } while (obj = obj.offsetParent);
  }
  return pos;
},


//--------------------------------------
// Event handlers
//--------------------------------------

onresize : function() {
  this.update();
},

menuItem_onClick : function(d) {
  switch(d.id) {
    case "show_page_actions": this.setPageActionsVisible(true); break;
    case "hide_page_actions": this.setPageActionsVisible(false); break;
    case "hide": hide(); break;
  }
},

actionItem_onClick : function(d) {
  alert("ACTION CLICK");
},

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
