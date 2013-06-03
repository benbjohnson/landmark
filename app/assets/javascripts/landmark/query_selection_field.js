//------------------------------------------------------------------------------
//
// Constructor
//
//------------------------------------------------------------------------------

function QuerySelectionField(name, expression) {
  this.name = name || "";
  this.expression = expression || "";
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
  this.name = obj.name || "";
  this.expression = obj.expression || "";
}
