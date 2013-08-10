//= require 'd3'
//= require_self
//= require hud/menu
//= require hud/actions
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

  hud.menu.initialize();
  hud.actions.initialize();
  hud.flow.initialize();
  hud.update();
},


//--------------------------------------
// Refresh
//--------------------------------------

update : function() {
  var w = window.innerWidth || document.documentElement.clientWidth;
  var h = window.innerHeight || document.documentElement.clientHeight;
  this.updateOverlay(w, h);
  this.menu.update(w, h);
  this.actions.update(w, h);
  this.flow.update(w, h);
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

