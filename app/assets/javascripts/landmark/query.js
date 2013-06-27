//------------------------------------------------------------------------------
//
// Constructor
//
//------------------------------------------------------------------------------

function Query(options) {
  this.deserialize(options)
}

//------------------------------------------------------------------------------
//
// Methods
//
//------------------------------------------------------------------------------

//--------------------------------------
// Hierarchy
//--------------------------------------

// Retrieves the query.
Query.prototype.getQuery = function() {
  return this;
}

// Adds a step to the query.
Query.prototype.addStep = function(step) {
  QuerySteps.addStep(this, step);
}

// Removes a step from the query.
Query.prototype.removeStep = function(step) {
  QuerySteps.removeStep(this, step);
}

// Removes all steps from the query.
Query.prototype.removeAllSteps = function() {
  QuerySteps.removeAllSteps(this);
}

// Finds a selection in the query by name.
Query.prototype.getSelection = function(name) {
  return QuerySteps.getSelection(this, name);
}

//--------------------------------------
// Serialization
//--------------------------------------

// Serializes the query to a hash.
Query.prototype.serialize = function() {
  return {sessionIdleTime:this.sessionIdleTime, steps:QuerySteps.serialize(this.steps)};
}

// Deserializes the query from a hash.
Query.prototype.deserialize = function(obj) {
  if(!obj) obj = {};
  this.sessionIdleTime = obj.sessionIdleTime || 0;
  QuerySteps.deserialize(this, obj.steps);
}
