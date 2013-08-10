//= require 'd3'
//= require_self
//= require hud/menu
//= require hud/flow
//= require hud/initialize

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

actions : {
  data:[]
},

links : {},

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
    .attr("class", "landmark-hud-overlay");
  this.overlay.g = this.overlay.svg.append("g");
  this.overlay.rect = this.overlay.g.append("rect");

  this.overlay.svg.append("filter")
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

  this.actions.svg = d3.select("body").append("svg")
    .attr("class", "landmark-hud-actions")
    .style("width", 0)
    .style("height", 0)
  ;

  hud.menu.initialize();
  hud.flow.initialize();
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
  this.menu.update(w, h);
  this.updatePageActions(w, h);
  this.flow.update(w, h);
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

updatePageActions : function(w, h) {
  var $this = this;
  var visible = (this.actions.data.length > 0);

  // Update link positions.
  this.actions.data.forEach(function(item) {
    var link = ($this.links[item.href] ? $this.links[item.href][0] : null);
    item.link = link;
    item.pos = $this.offset(link);
  });

  // Create the link rects.
  var data = this.actions.data.filter(function(d) { return d.link && d.link.offsetWidth > 0; });
  this.actions.svg.selectAll(".landmark-hud-action-item")
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
            .text(function(d) { return Math.round((d.count/$this.actions.total)*100) + "%"; })
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
  this.actions.svg
    .style("width", (visible ? null : 0))
    .style("height", (visible ? documentHeight - 20 : 0))
  ;
},


//--------------------------------------
// Page Actions
//--------------------------------------

setPageActionsVisible : function(enabled) {
  var $this = this;
  if(enabled) {
    d3.json(landmark.baseUrl() + "/api/v1/resources/next_page_actions?apiKey=" + encodeURIComponent(landmark.apiKey) + "&name=" + encodeURIComponent(landmark.resource()), function(error, json) {
      if(error) return landmark.log(error);
      $this.actions.total = json.count;
      $this.actions.data = $this.normalizeActionData(json);
      $this.update();
    });
  } else {
    this.actions.data = [];
  }

  this.overlay.enabled = enabled;
  this.menu.opened = false;
  this.menu.setMenuItemVisible("show_page_actions", !enabled);
  this.menu.setMenuItemVisible("hide_page_actions", enabled);
  this.update();
},

normalizeActionData : function(data) {
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

ellipsize : function(url, length) {
  if(!url) return "";
  url = url.replace(/http:\/\/(www\.)?/g, "");
  if(url.length >= length) {
    tmp = url.substring(0, (length / 2));
    tmp2 = url.substr(url.length - (length / 2));
    return tmp + "…" + tmp2;
  } else {
    return url;
  }
},


//--------------------------------------
// Event handlers
//--------------------------------------

onresize : function() {
  this.update();
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

// Load stylesheet.
var linkTag = document.createElement('link');
linkTag.rel = "stylesheet";
linkTag.href = landmark.baseUrl() + "/assets/landmark-hud.css";
landmark.scriptTag.parentNode.insertBefore(linkTag);
})();

