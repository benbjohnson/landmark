(function(){

//------------------------------------------------------------------------------
//
// Variables
//
//------------------------------------------------------------------------------

var properties = [];


//------------------------------------------------------------------------------
//
// Methods
//
//------------------------------------------------------------------------------

/**
 * Gets or sets a list of all the properties.
 */
landmark.properties = function(value) {
  if(arguments.length == 0) return properties;
  properties = [];
  for(var i=0; i<value.length; i++) {
    properties[i] = new Property(value[i]);
  }
  return properties;
}

/**
 * Finds a single property by id or name.
 */
landmark.properties.find = function(id) {
  for(var i=0; i<properties.length; i++) {
    if(properties[i].id == id || properties[i].name == id) {
      return properties[i];
    }
  }
}

/**
 * The compare function to sort properties by name.
 */
landmark.properties.sortFunction = function(a, b) {
  if(a.name < b.name) {
    return -1;
  } else if(a.name > b.name) {
    return 1;
  }
  else {
    return 0;
  }
}

})();