//------------------------------------------------------------------------------
//
// Constructor
//
//------------------------------------------------------------------------------

function QueryCondition(options) {
  this.deserialize(options);
}

//------------------------------------------------------------------------------
//
// Methods
//
//------------------------------------------------------------------------------

//--------------------------------------
// Hierarchy
//--------------------------------------

// Retrieves the top-level query associated with this condition.
QueryCondition.prototype.getQuery = function() {
  if(this.parent) {
    return this.parent.getQuery();
  }
  return null;
}

// Adds a step to the condition.
QueryCondition.prototype.addStep = function(step) {
  QuerySteps.addStep(this, step);
}

// Removes a step from the condition.
QueryCondition.prototype.removeStep = function(step) {
  QuerySteps.removeStep(this, step);
}

// Finds a selection in the query condition by name.
QueryCondition.prototype.getSelection = function(name) {
  return QuerySteps.getSelection(this, name);
}

//--------------------------------------
// Serialization
//--------------------------------------

// Serializes the condition to a hash.
QueryCondition.prototype.serialize = function() {
  return {
    type:"condition",
    expression:this.expression,
    within:this.within,
    withinUnits:this.withinUnits,
    steps:QuerySteps.serialize(this.steps)
  };
}

// Deserializes the condition from a hash.
QueryCondition.prototype.deserialize = function(obj) {
  if(!obj) obj = {};
  this.expression = obj.expression || "";
  this.within = obj.within || null;
  this.withinUnits = obj.withinUnits || "steps";
  QuerySteps.deserialize(this, obj.steps);
}
