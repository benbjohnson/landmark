landmark.show = {};

(function(){
//------------------------------------------------------------------------------
//
// Variables
//
//------------------------------------------------------------------------------

var query = {
  sessionIdleTime:7200,
  steps: [
    {type:"condition", expression:"true", within:[0,0], steps:[
      {type:"selection", name:"0:0", dimensions:["action"], fields:[{name:"count", expression:"count()"}]}
    ]}
  ]
};


//------------------------------------------------------------------------------
//
// Functions
//
//------------------------------------------------------------------------------

//--------------------------------------
// Loading
//--------------------------------------

landmark.show.load = function(q) {
  if(!q) {
    query = q;
  }
  
  var xhr = $.ajax("/query.json", {method:"POST", data:JSON.stringify({q:query}), contentType:"application/json"})
  .success(function(data) {
    nodes = skybox.explore.normalize(query, data, {limit:6});
    links = skybox.explore.links(nodes);
    skybox.explore.update();
  })
  // Notify the user if the query fails for some reason.
  .fail(function() {
    alert("Unable to load query data.");
  })
  .always(function() {
    $(".loading").hide();
  });

}

//------------------------------------------------------------------------------
//
// Events
//
//------------------------------------------------------------------------------

})();
