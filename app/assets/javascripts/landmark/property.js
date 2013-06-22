//------------------------------------------------------------------------------
//
// Constructor
//
//------------------------------------------------------------------------------

function Property(options) {
  this.deserialize(options);
}

//------------------------------------------------------------------------------
//
// Methods
//
//------------------------------------------------------------------------------

//--------------------------------------
// Serialization
//--------------------------------------

// Serializes the property to a hash.
Property.prototype.serialize = function() {
  return {id:this.id, name:this.name, transient:this.transient, dataType:this.dataType};
}

// Deserializes the property from a hash.
Property.prototype.deserialize = function(obj) {
  if(!obj) obj = {};
  this.id = obj.id || 0;
  this.name = obj.name || "";
  this.transient = (obj.transient == true);
  this.dataType = obj.dataType || "string";
}
