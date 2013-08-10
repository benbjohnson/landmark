//= require 'd3'
//= require_self
//= require hud/overlay
//= require hud/menu
//= require hud/actions
//= require hud/flow
//= require hud/initialize

(function() {

var hud = {

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
  
  hud.overlay.initialize();
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
  this.overlay.update(w, h);
  this.menu.update(w, h);
  this.actions.update(w, h);
  this.flow.update(w, h);
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

