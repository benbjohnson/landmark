//------------------------------------------------------------------------------
//
// Constructor
//
//------------------------------------------------------------------------------

function QuerySelection(name, dimensions, fields) {
  this.name = name || "";
  this.dimensions = dimensions || [];
  this.fields = [];
  for(var i=0; i<(fields || []).length; i++) {
    this.addField(fields[i]);
  }
}

//------------------------------------------------------------------------------
//
// Methods
//
//------------------------------------------------------------------------------

//--------------------------------------
// Fields
//--------------------------------------

// Adds a field to the selection.
QuerySelection.prototype.addField = function(field) {
  field.selection = this;
  this.fields.push(field);
}

// Removes a field from the selection.
QuerySelection.prototype.removeField = function(field) {
  for(var i=0; i<this.fields.length; i++) {
    if(this.fields[i] == field) {
      field.selection = null;
      this.fields.splice(i--, 1);
    }
  }
}

//--------------------------------------
// Serialization
//--------------------------------------

// Serializes the selection to a hash.
QuerySelection.prototype.serialize = function() {
  var fields = [];
  for(var i=0; i<this.fields.length; i++) {
    fields.push(this.fields[i].serialize());
  }
  return {
    name:this.name,
    dimensions:this.dimensions.slice(),
    fields:fields
  };
}

// Deserializes the selection from a hash.
QuerySelection.prototype.deserialize = function(obj) {
  this.name = obj.name || "";
  this.dimensions = (obj.dimensions || []).slice();
  this.fields = [];
  for(var i=0; i<(obj.fields || []).length; i++) {
    var field = new QuerySelectionField();
    field.deserialize(obj.fields[i]);
    this.fields.push(field);
  }
}
