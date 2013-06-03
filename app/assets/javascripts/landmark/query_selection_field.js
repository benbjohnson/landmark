//------------------------------------------------------------------------------
//
// Constructor
//
//------------------------------------------------------------------------------

function QuerySelectionField(options) {
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

// Serializes the field to a hash.
QuerySelectionField.prototype.serialize = function() {
  return {name:this.name, expression:this.expression};
}

// Deserializes the field from a hash.
QuerySelectionField.prototype.deserialize = function(obj) {
  if(!obj) obj = {};
  this.name = obj.name || "";
  this.expression = obj.expression || "";
}
