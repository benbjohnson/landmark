//------------------------------------------------------------------------------
//
// Constructor
//
//------------------------------------------------------------------------------

function QuerySelection(options) {
  this.deserialize(options);
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
    type:"selection",
    name:this.name,
    dimensions:this.dimensions.slice(),
    fields:fields
  };
}

// Deserializes the selection from a hash.
QuerySelection.prototype.deserialize = function(obj) {
  if(!obj) obj = {};
  this.name = obj.name || "";
  this.dimensions = (obj.dimensions || []).slice();
  this.fields = [];
  for(var i=0; i<(obj.fields || []).length; i++) {
    var field;
    if(obj.fields[i] instanceof QuerySelectionField) {
      field = obj.fields[i]
    } else {
      field = new QuerySelectionField(obj.fields[i]);
    }
    this.fields.push(field);
  }
}
